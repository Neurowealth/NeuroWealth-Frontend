import { WhatsAppWebhookPayload, ParsedMessage } from '../types/whatsapp';

/**
 * Parses a raw Meta WhatsApp webhook payload and extracts
 * all text messages from all entries/changes.
 */
export function parseWebhookPayload(payload: WhatsAppWebhookPayload): ParsedMessage[] {
  const messages: ParsedMessage[] = [];

  if (payload.object !== 'whatsapp_business_account') return messages;

  for (const entry of payload.entry) {
    for (const change of entry.changes) {
      if (change.field !== 'messages') continue;

      const { value } = change;
      const rawMessages = value.messages || [];

      for (const msg of rawMessages) {
        const contact = value.contacts?.find((c) => c.wa_id === msg.from);
        const base = {
          from: msg.from,
          message_id: msg.id,
          timestamp: parseInt(msg.timestamp, 10),
          type: msg.type,
          phone_number_id: value.metadata.phone_number_id,
          display_phone_number: value.metadata.display_phone_number,
          contact_name: contact?.profile.name,
        };

        if (msg.type === 'text' && msg.text?.body) {
          messages.push({ ...base, text: { body: msg.text.body } });
        } else if (msg.type === 'interactive' && msg.interactive?.button_reply) {
          const { id, title } = msg.interactive.button_reply;
          messages.push({ ...base, text: { body: title }, buttonId: id });
        }
      }
    }
  }

  return messages;
}

/**
 * Validates the top-level shape of a webhook payload.
 */
export function isValidWebhookPayload(body: unknown): body is WhatsAppWebhookPayload {
  if (!body || typeof body !== 'object') return false;
  const b = body as Record<string, unknown>;
  return (
    b.object === 'whatsapp_business_account' &&
    Array.isArray(b.entry) &&
    b.entry.length > 0
  );
}
