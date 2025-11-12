import { BasePage } from './BasePage';

/**
 * ChatPage - Page Object for Chat functionality
 * Maps to frontend chat components:
 *   - ChatInput.tsx
 *   - Message.tsx
 *   - MessageList.tsx
 * Uses data-testid selectors for better test resilience
 */
export class ChatPage extends BasePage {
  // Selectors using data-testid attributes
  // These correspond to elements in:
  //   - frontend/src/presentation/components/chat/ChatInput/ChatInput.tsx
  //   - frontend/src/presentation/components/chat/Message/Message.tsx
  //   - frontend/src/presentation/components/chat/MessageList/MessageList.tsx
  private readonly selectors = {
    // Chat Input container
    inputContainer: '[data-testid="chat-input-container"]',
    inputWrapper: '[data-testid="chat-input-wrapper"]',
    inputField: '[data-testid="chat-input-field"]',
    sendButton: '[data-testid="chat-input-send-button"]',

    // Message List
    messageListContainer: '[data-testid="chat-message-list-container"]',
    messageListEmpty: '[data-testid="chat-message-list-empty"]',
    messageListLoading: '[data-testid="chat-message-list-loading"]',
    messageListScrollAnchor: '[data-testid="chat-message-list-scroll-anchor"]',

    // Message (individual)
    messageUserBubble: '[data-testid="chat-message-user"]',
    messageBotBubble: '[data-testid="chat-message-bot"]',
    messageWrapper: '[data-testid="chat-message-wrapper"]',
    messageBubble: '[data-testid="chat-message-bubble"]',
    messageAuthor: '[data-testid="chat-message-author"]',
    messageTimestamp: '[data-testid="chat-message-timestamp"]',
  };

  constructor() {
    super('/');
  }

  /**
   * Type a message
   */
  typeMessage(message: string): this {
    this.type(this.selectors.inputField, message);
    return this;
  }

  /**
   * Send a message
   */
  sendMessage(message?: string): this {
    if (message) {
      this.typeMessage(message);
    }
    this.click(this.selectors.sendButton);
    return this;
  }

  /**
   * Get current input value
   */
  getInputValue(): Cypress.Chainable<string> {
    return this.getElement(this.selectors.inputField).invoke('val') as Cypress.Chainable<string>;
  }

  /**
   * Clear input field
   */
  clearInput(): this {
    this.getElement(this.selectors.inputField).clear();
    return this;
  }

  /**
   * Verify chat input is visible
   */
  verifyChatInputVisible(): this {
    this.waitForElement(this.selectors.inputContainer);
    return this;
  }

  /**
   * Verify send button is disabled
   */
  verifySendButtonDisabled(): this {
    this.getElement(this.selectors.sendButton).should('be.disabled');
    return this;
  }

  /**
   * Verify send button is enabled
   */
  verifySendButtonEnabled(): this {
    this.getElement(this.selectors.sendButton).should('be.enabled');
    return this;
  }

  /**
   * Verify message list is visible
   */
  verifyMessageListVisible(): this {
    this.waitForElement(this.selectors.messageListContainer);
    return this;
  }

  /**
   * Verify message list is empty
   */
  verifyMessageListEmpty(): this {
    this.waitForElement(this.selectors.messageListEmpty);
    return this;
  }

  /**
   * Verify loading indicator is visible
   */
  verifyLoadingVisible(): this {
    this.waitForElement(this.selectors.messageListLoading);
    return this;
  }

  /**
   * Get number of messages in list
   */
  getMessageCount(): Cypress.Chainable<number> {
    return this.getElement(`${this.selectors.messageListContainer} [data-testid^="chat-message-item-"]`)
      .then(($elements) => $elements.length);
  }

  /**
   * Get specific message text by index
   */
  getMessageText(index: number): Cypress.Chainable<string> {
    return this.getElement(`[data-testid="chat-message-item-${index}"] ${this.selectors.messageBubble}`)
      .invoke('text');
  }

  /**
   * Verify user message is displayed
   */
  verifyUserMessageDisplayed(messageText: string): this {
    this.getElement(this.selectors.messageUserBubble)
      .should('contain', messageText);
    return this;
  }

  /**
   * Verify bot message is displayed
   */
  verifyBotMessageDisplayed(messageText: string): this {
    this.getElement(this.selectors.messageBotBubble)
      .should('contain', messageText);
    return this;
  }

  /**
   * Verify last message is from user
   */
  verifyLastMessageFromUser(): this {
    this.getElement(`${this.selectors.messageListContainer} ${this.selectors.messageUserBubble}`)
      .last()
      .should('be.visible');
    return this;
  }

  /**
   * Verify last message is from bot
   */
  verifyLastMessageFromBot(): this {
    this.getElement(`${this.selectors.messageListContainer} ${this.selectors.messageBotBubble}`)
      .last()
      .should('be.visible');
    return this;
  }

  /**
   * Verify message timestamp is visible
   */
  verifyTimestampVisible(): this {
    this.waitForElement(this.selectors.messageTimestamp);
    return this;
  }

  /**
   * Wait for new message to appear
   */
  waitForNewMessage(timeoutMs: number = 10000): this {
    this.waitForElement(`${this.selectors.messageListContainer} [data-testid^="chat-message-item-"]`, timeoutMs);
    return this;
  }

  /**
   * Scroll to bottom of message list
   */
  scrollToBottom(): this {
    this.scrollToElement(this.selectors.messageListScrollAnchor);
    return this;
  }

  /**
   * Complete chat flow: send message and wait for response
   */
  sendMessageAndWaitForResponse(userMessage: string, timeoutMs: number = 10000): this {
    this.sendMessage(userMessage);
    this.waitForNewMessage(timeoutMs);
    return this;
  }
}
