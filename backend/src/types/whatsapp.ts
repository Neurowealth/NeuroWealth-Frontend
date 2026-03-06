export interface WhatsAppTextMessage {
  from: string;         // sender's phone number (E.164 format)
  message_id: string;   // unique message ID (wamid)
  timestamp: number;    // Unix timestamp
  text: {
    body: string;       // message content
  };
  type: 'text';
}

export interface WhatsAppContact {
  profile: { name: string };
  wa_id: string;
}

export interface WhatsAppValue {
  messaging_product: string;
  metadata: {
    display_phone_number: string;
    phone_number_id: string;
  };
  contacts?: WhatsAppContact[];
  messages?: RawWhatsAppMessage[];
  statuses?: WhatsAppStatus[];
}

export interface RawWhatsAppMessage {
  from: string;
  id: string;
  timestamp: string;
  type: string;
  text?: { body: string };
  image?: { id: string; mime_type: string; sha256: string; caption?: string };
  audio?: { id: string; mime_type: string };
  document?: { id: string; mime_type: string; filename?: string };
}

export interface WhatsAppStatus {
  id: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  recipient_id: string;
}

export interface WhatsAppWebhookPayload {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      value: WhatsAppValue;
      field: string;
    }>;
  }>;
}

export interface ParsedMessage {
  from: string;
  message_id: string;
  timestamp: number;
  text: { body: string };
  type: string;
  phone_number_id: string;
  display_phone_number: string;
  contact_name?: string;
}
