import React from "react";
import styles from "./Message.module.css";

type Props = {
    msg: MessageType;
};

interface MessageType {
    user: string;
    content: string;
    timestamp?: Date;
    error?: boolean;
}

const Message: React.FC<Props> = ({ msg }) => {
    const isUser = msg.user === "user";

    if (!msg.content || msg.content.length === 0) {
        return null;
    }

    return (
        <div className={`${styles.message} ${styles[isUser ? "user" : "bot"]}`}>
            <div className={styles.messageWrapper}>
                <div
                    className={`${styles.messageBubble} ${styles[isUser ? "userMessage" : "botMessage"]}${msg.error ? ` ${styles.errorMessage}` : ""}`}
                >
                    {msg.content}
                </div>
                <small className={styles.timestamp}>
                    {msg.timestamp?.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </small>
            </div>
        </div>
    );
};

export default Message;