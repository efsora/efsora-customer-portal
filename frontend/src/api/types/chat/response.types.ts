// Chat message type from history response
export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    createdAt: string;
}

// Chat history response (array of messages)
export interface ChatHistoryResponse {
    messages: ChatMessage[];
}

// Error response
export interface ChatErrorResponse {
    message: string;
    code: string;
}
