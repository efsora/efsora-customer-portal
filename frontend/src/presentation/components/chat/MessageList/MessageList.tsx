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
        <div className={styles.chatBox}>
            {messages.length === 0 && emptyContent}
            {messages.map((msg, index) => (
                <Message key={index} msg={msg}/>
            ))}
            {loading && (
                <div className={styles.loaderWrapper}>
                    <div className={styles.loader}/>
                </div>
            )}
            <div ref={endOfMessagesRef}/>
        </div>
    );
};
