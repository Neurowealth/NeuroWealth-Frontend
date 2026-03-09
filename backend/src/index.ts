import "dotenv/config";
import { createApp } from "./app";
import { logger } from "./utils/logger";
import { eventBus } from "./services/eventBus";
import { ParsedMessage } from "./types/whatsapp";
import { initSocket } from "./services/socket";
import { handleOnboarding } from "./services/onboarding";

const PORT = parseInt(process.env.PORT || "3000", 10);

const app = createApp();

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

    if (typeof reply === "string") {
      await replyToUser(message.from, message.phone_number_id, reply);
    } else {
      await replyWithButtons(
        message.from,
        message.phone_number_id,
        reply.body,
        reply.buttons,
      );
    }
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

// ─── Helper: send interactive button reply via Meta Cloud API ────────────────
async function replyWithButtons(
  to: string,
  phoneNumberId: string,
  body: string,
  buttons: Array<{ id: string; title: string }>,
): Promise<void> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!token || !phoneNumberId) {
    logger.info({ to, body, buttons }, "📤 [DEV] Bot interactive reply (no credentials set)");
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
      type: "interactive",
      interactive: {
        type: "button",
        body: { text: body },
        action: {
          buttons: buttons.map((b) => ({
            type: "reply",
            reply: { id: b.id, title: b.title },
          })),
        },
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    logger.error({ to, status: res.status, err }, "Failed to send interactive reply");
  } else {
    logger.info({ to }, "WhatsApp interactive reply sent successfully");
  }
}

// ── Start server ───────────────────────────────────────────────────────────
const server = app.listen(PORT, () => {
  logger.info(`NeuroWealth webhook server listening on port ${PORT}`);
});

// ── Initialize WebSocket ───────────────────────────────────────────────────
initSocket(server);

// ── Graceful shutdown ──────────────────────────────────────────────────────
const shutdown = (signal: string) => {
  logger.info(`${signal} received — shutting down gracefully`);
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
