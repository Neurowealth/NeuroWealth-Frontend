import { Router, Request, Response } from "express";
import { logger } from "../utils/logger";

const router: Router = Router();

router.post("/send", async (req: Request, res: Response) => {
    try {
        const { to, text, useTemplate } = req.body;

        if (!to || (!text && !useTemplate)) {
            return res.status(400).json({ error: "Missing 'to' or 'text' fields" });
        }

        const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
        const token = process.env.WHATSAPP_ACCESS_TOKEN;

        if (!phoneNumberId || !token) {
            logger.error("Missing WhatsApp credentials in environment");
            return res.status(500).json({ error: "Server not configured" });
        }

        const url = `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`;
        let payload;

        if (useTemplate) {
            payload = {
                messaging_product: "whatsapp",
                to,
                type: "template",
                template: {
                    name: "hello_name",
                    language: { code: "en_US" },
                    components: [
                        {
                            type: "body",
                            parameters: [
                                { type: "text", text }
                            ]
                        }
                    ]
                }
            };
        } else {
            payload = {
                messaging_product: "whatsapp",
                to,
                type: "text",
                text: { body: text },
            };
        }

        logger.info({ url, payload }, "Sending WhatsApp message");

        const response = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();
        if (!response.ok) {
            logger.error({ data }, "Failed to send WhatsApp message");
            return res.status(response.status).json(data);
        }

        logger.info({ to, text, data }, "WhatsApp message sent successfully");

        res.json({ success: true, data, sentText: text });
    } catch (error: any) {
        logger.error({ message: error.message, stack: error.stack }, "Unexpected error in /send");
        res.status(500).json({ error: error.message || "Failed to send WhatsApp message" });
    }
});

export default router;