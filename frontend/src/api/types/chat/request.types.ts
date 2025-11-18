export interface ChatStreamRequest {
    message: string;
    sessionId: string;
}

export interface GetChatHistoryParams {
    sessionId: string;
}
