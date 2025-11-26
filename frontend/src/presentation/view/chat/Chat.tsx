import React, { useState, useMemo } from 'react';

import { useChat } from '#api/hooks/useChat';
import { ChatInput } from '#components/chat/ChatInput/ChatInput';
import { MessageList } from '#components/chat/MessageList/MessageList';
import Message from '#presentation/components/chat/Message/Message';

import styles from './Chat.module.css';

interface MessageType {
    user: string;
    content: string;
    timestamp: Date;
    error?: boolean;
}

const Chat: React.FC = () => {
    const [input, setInput] = useState<string>('');

    // Use the chat hook with real API integration
    const {
        messages: apiMessages,
        isStreaming,
        isLoadingHistory,
        sendMessage: sendApiMessage,
    } = useChat();

    // Convert API messages to component format
    const messages = useMemo<MessageType[]>(() => {
        return apiMessages.map((msg) => ({
            user: msg.role === 'user' ? 'user' : 'bot',
            content: msg.content || '',
            timestamp: msg.createdAt ? new Date(msg.createdAt) : new Date(),
            error: msg.content?.startsWith('Error:'),
        }));
    }, [apiMessages]);

    const loading = isStreaming || isLoadingHistory;

    const sendMessage = async (): Promise<void> => {
        if (!input.trim() || loading) return;

        const messageContent = input;
        setInput('');

        await sendApiMessage(messageContent);
    };

    return (
        <div className={styles.content}>
            <div className={styles.chatContainer}>
                <ChatHeader />
                <MessageList
                    messages={messages}
                    loading={loading}
                    emptyContent={
                        <div>
                            <Message
                                msg={{
                                    user: 'bot',
                                    content:
                                        'Hello! I can help you find documents, answer questions about project status, and more. What would you like to know?',
                                }}
                            />
                        </div>
                    }
                />
                <ChatInput
                    input={input}
                    onInputChange={setInput}
                    onSend={sendMessage}
                    disabled={loading}
                />
            </div>
        </div>
    );
};

export default Chat;

export function ChatHeader() {
    return (
        <div className={styles.chatHeaderContainer}>
            <div className={styles.chatHeaderHeader}>AI Assistant</div>
            <div>Ask questions about your documents.</div>
        </div>
    );
}
