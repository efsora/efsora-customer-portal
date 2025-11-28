import React from 'react';
import Markdown from 'react-markdown';
import type { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

import styles from './Message.module.css';

type Props = {
    msg: MessageType;
};

interface MessageType {
    user: string;
    content: string;
    timestamp?: Date;
    error?: boolean;
}

/**
 * Sanitizes incomplete markdown by temporarily closing unclosed syntax.
 * This ensures partial markdown during streaming renders gracefully.
 */
const sanitizePartialMarkdown = (content: string): string => {
    let sanitized = content;

    // Count occurrences of markdown syntax
    const boldCount = (content.match(/\*\*/g) || []).length;
    const italicCount = (content.match(/(?<!\*)\*(?!\*)/g) || []).length;
    const codeCount = (content.match(/`/g) || []).length;
    const tildeCount = (content.match(/~~/g) || []).length;

    // If odd number of markers, temporarily close them
    if (boldCount % 2 !== 0) {
        sanitized += '**';
    }
    if (italicCount % 2 !== 0) {
        sanitized += '*';
    }
    if (codeCount % 2 !== 0) {
        sanitized += '`';
    }
    if (tildeCount % 2 !== 0) {
        sanitized += '~~';
    }

    return sanitized;
};

const Message: React.FC<Props> = ({ msg }) => {
    const isUser = msg.user === 'user';

    if (!msg.content || msg.content.length === 0) {
        return null;
    }

    // Sanitize partial markdown for streaming messages
    const sanitizedContent = sanitizePartialMarkdown(msg.content);

    // Custom components for markdown rendering
    const markdownComponents: Components = {
        code: ({ className, children, ...props }) => {
            const isInline = !className;
            return isInline ? (
                <code className={styles.inlineCode} {...props}>
                    {children}
                </code>
            ) : (
                <pre className={styles.codeBlock}>
                    <code className={className} {...props}>
                        {children}
                    </code>
                </pre>
            );
        },
        a: ({ children, ...props }) => (
            <a
                className={styles.link}
                target="_blank"
                rel="noopener noreferrer"
                {...props}
            >
                {children}
            </a>
        ),
        ul: ({ children, ...props }) => (
            <ul className={styles.list} {...props}>
                {children}
            </ul>
        ),
        ol: ({ children, ...props }) => (
            <ol className={styles.list} {...props}>
                {children}
            </ol>
        ),
        p: ({ children, ...props }) => (
            <p className={styles.paragraph} {...props}>
                {children}
            </p>
        ),
    };

    return (
        <div
            className={`${styles.message} ${styles[isUser ? 'user' : 'bot']}`}
            data-testid={isUser ? 'chat-message-user' : 'chat-message-bot'}
        >
            <div className={styles.messageWrapper} data-testid="chat-message-wrapper">
                <div
                    className={`${styles.messageBubble} ${styles[isUser ? 'userMessage' : 'botMessage']}${msg.error ? ` ${styles.errorMessage}` : ''}`}
                    data-testid="chat-message-bubble"
                >
                    <Markdown
                        remarkPlugins={[remarkGfm]}
                        components={markdownComponents}
                    >
                        {sanitizedContent}
                    </Markdown>
                </div>
                <small className={styles.timestamp} data-testid="chat-message-timestamp">
                    {msg.timestamp?.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </small>
            </div>
        </div>
    );
};

export default Message;
