import React, { useState } from "react";

import { ChatInput } from "#components/chat/ChatInput/ChatInput";
import { MessageList } from "#components/chat/MessageList/MessageList";
import styles from "./Chat.module.css";


interface MessageType {
    user: string;
    content: string;
    timestamp: Date;
    error?: boolean;
}


const Chat: React.FC = () => {
    const [messages, setMessages] = useState<MessageType[]>([]);
    const [input, setInput] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const sendMessage = (): void => {
        if (!input.trim() || loading) return;

        const userMessage: MessageType = {
            user: "user",
            content: input,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setLoading(true);
        setInput("");

        // Hardcoded bot reply
        setTimeout(() => {
            const botMessage: MessageType = {
                user: "bot",
                content: "Hello! I'm your bot. 👋 How can I help?",
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, botMessage]);
            setLoading(false);
        }, 600); 
    };

    return (
        <div className={styles.content}>
            <div className={styles.chatContainer}>
                <MessageList
                    messages={messages}
                    loading={loading}
                    emptyContent={<div>empty content</div>}
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
