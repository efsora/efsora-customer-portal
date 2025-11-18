import type { operations } from '../../../../schema';

export type ChatStreamRequest =
    operations['chatStream']['requestBody']['content']['application/json'];

export type GetChatHistoryParams =
    operations['getChatHistory']['parameters']['path'];
