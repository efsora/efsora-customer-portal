import React, {useEffect, useRef} from "react";
import Message from "../Message/Message";
import styles from "./MessageList.module.css";

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
            endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, loading]);
    return (
        <div
            className={styles.chatBox}
            data-testid="chat-message-list-container"
        >
            {messages.length === 0 && (
                <div data-testid="chat-message-list-empty">
                    {emptyContent}
                </div>
            )}
            {messages.map((msg, index) => (
                <div
                    key={index}
                    data-testid={`chat-message-item-${index}`}
                >
                    <Message msg={msg}/>
                </div>
            ))}
            {loading && (
                <div
                    className={styles.loaderWrapper}
                    data-testid="chat-message-list-loading"
                >
                    <div className={styles.loader}/>
                </div>
            )}
            <div
                ref={endOfMessagesRef}
                data-testid="chat-message-list-scroll-anchor"
            />
        </div>
    );
};
