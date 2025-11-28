import React, { useEffect, useRef } from 'react';

import styles from './MessageList.module.css';
import Message from '../Message/Message';

type Props = {
    messages: MessageType[];
    loading: boolean;
    emptyContent: React.ReactNode;
};

interface MessageType {
    user: string;
    content: string;
    timestamp: Date;
    error?: boolean;
}

export function MessageList({ messages, loading, emptyContent }: Props) {
    const endOfMessagesRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        if (endOfMessagesRef.current) {
            endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, loading]);
    return (
        <div className={styles.chatBox} data-testid="chat-message-list-container">
            {messages.length === 0 && (
                <div data-testid="chat-message-list-empty">{emptyContent}</div>
            )}
            {messages.map((msg, index) => (
                <Message key={index} msg={msg} />
            ))}
            {loading && (
                <div className={styles.loaderWrapper} data-testid="chat-message-list-loading">
                    <div className={styles.loader} />
                </div>
            )}
            <div ref={endOfMessagesRef} data-testid="chat-message-list-scroll-anchor" />
        </div>
    );
}
