import React from "react";
import styles from "./ChatInput.module.css";

interface Props {
    input: string;
    onInputChange: (val: string) => void;
    onSend: () => void;
    disabled?: boolean;
}

export function ChatInput({
        input,
        onInputChange,
        onSend,
        disabled = false,
    }: Props) {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            onSend();
        }
    };
    const isInputEmpty = input.trim() === "";

    return (
        <div className={styles.inputArea}>
            <div className={styles.inputWrapper}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => onInputChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className={styles.inputAreaInput}
                    placeholder="Type your message..."
                    disabled={disabled}
                />
                <button
                    onClick={() => onSend()}
                    className={styles.button}
                    disabled={isInputEmpty || disabled}
                >
                    <img src="/dropdown-up-white.svg" alt="placeholder" />
                </button>
            </div>
        </div>
    );
};
