import type { operations } from '../../../../schema';

// Chat message type from history response
export type ChatMessage = NonNullable<
    operations['getChatHistory']['responses']['200']['content']['application/json']['messages']
>[number];

// Chat history response (array of messages)
export type ChatHistoryResponse =
    operations['getChatHistory']['responses']['200']['content']['application/json'];

// Error response
export type ChatErrorResponse =
    operations['chatStream']['responses']['401']['content']['application/json'];
