import "dotenv/config";
import { createApp } from "./app";
import { logger } from "./utils/logger";
import { eventBus } from "./services/eventBus";
import { ParsedMessage } from "./types/whatsapp";
import { initSocket } from "./services/socket";
import { handleOnboarding } from "./services/onboarding";
import pool from "./db/pool";
import { depositRecorder } from "./services/depositRecorder";
import { deploymentCoordinator } from "./services/deploymentCoordinator";
import { depositMessaging } from "./services/depositMessaging";
import { depositMonitor } from "./services/depositMonitor";

const PORT = parseInt(process.env.PORT || "3000", 10);

const app = createApp();

// ── Initialize database connection ──────────────────────────────────────────
async function initializeDatabase(): Promise<void> {
  try {
    await pool.query('SELECT NOW()');
    logger.info('Database connection established');
  } catch (err) {
    logger.error({ err }, 'Failed to connect to database');
    throw err;
  }
}

// ── Initialize deposit services ─────────────────────────────────────────────
async function initializeDepositServices(): Promise<void> {
  try {
    logger.info('Initializing deposit services');

    // Start services in correct order
    depositRecorder.start();
    deploymentCoordinator.start();
    depositMessaging.start();
    await depositMonitor.start();

    logger.info('All deposit services initialized successfully');
  } catch (err) {
    logger.error({ err }, 'Failed to initialize deposit services');
    throw err;
  }
}

// ── WhatsApp message handler ────────────────────────────────────────────────
eventBus.onMessage(async (message: ParsedMessage) => {
  logger.info(
    {
      from: message.from,
      message_id: message.message_id,
      text: message.text.body,
      timestamp: message.timestamp,
    },
    "New WhatsApp message received",
  );

  try {
    const replyText = await handleOnboarding(message, replyToUser);
    if (!replyText) return;

    // Send reply via Meta Cloud API using your existing /api/message/send route
    await replyToUser(message.from, message.phone_number_id, replyText);
  } catch (err) {
    logger.error({ err, from: message.from }, "Onboarding handler failed");
  }
});

eventBus.onParseError(({ error }) => {
  logger.error({ error: error.message }, "Failed to process webhook message");
});

// ─── Helper: send a reply via Meta Cloud API ─────────────────────────────────
async function replyToUser(
  to: string,
  phoneNumberId: string,
  text: string,
): Promise<void> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!token || !phoneNumberId) {
    // Dev mode — just log the reply so you can see it without real credentials
    logger.info({ to, text }, "📤 [DEV] Bot reply (no credentials set)");
    return;
  }

  const url = `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: text },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    logger.error(
      { to, status: res.status, err },
      "Failed to send WhatsApp reply",
    );
  } else {
    logger.info({ to }, "WhatsApp reply sent successfully");
  }
}

// ── Start server ───────────────────────────────────────────────────────────
async function startServer(): Promise<void> {
  try {
    // Initialize database
    await initializeDatabase();

    // Initialize deposit services
    await initializeDepositServices();

    // Start HTTP server
    const server = app.listen(PORT, () => {
      logger.info(`NeuroWealth webhook server listening on port ${PORT}`);
    });

    // Initialize WebSocket
    initSocket(server);

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received — shutting down gracefully`);

      // Stop deposit monitor
      await depositMonitor.stop();

      // Close database pool
      await pool.end();

      server.close(() => {
        logger.info("Server closed");
        process.exit(0);
      });

      setTimeout(() => {
        logger.error("Force exit after timeout");
        process.exit(1);
      }, 10_000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (err) {
    logger.error({ err }, 'Failed to start server');
    process.exit(1);
  }
}

// Start the server
startServer();
