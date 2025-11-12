import React from "react";
import styles from "./Message.module.css";

type Props = {
    msg: MessageType;
};

interface MessageType {
    user: string;
    content: string;
    timestamp: Date;
    error?: boolean;
}

const Message: React.FC<Props> = ({ msg }) => {
    const isUser = msg.user === "user";

    if (!msg.content || msg.content.length === 0) {
        return null;
    }

    return (
        <div
            className={`${styles.message} ${styles[isUser ? "user" : "bot"]}`}
            data-testid={`chat-message-${isUser ? "user" : "bot"}`}
        >
            <div
                className={styles.messageWrapper}
                data-testid="chat-message-wrapper"
            >
                <div
                    className={styles.name}
                    data-testid="chat-message-author"
                >
                    {msg.user}
                </div>
                <div
                    className={`${styles.messageBubble} ${styles[isUser ? "userMessage" : "botMessage"]}${msg.error ? ` ${styles.errorMessage}` : ""}`}
                    data-testid="chat-message-bubble"
                >
                    {msg.content}
                </div>
                <small
                    className={styles.timestamp}
                    data-testid="chat-message-timestamp"
                >
                    {msg.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </small>
            </div>
        </div>
    );
};

export default Message;