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
  //   - frontend/src/presentation/components/common/FloatingCircle/FloatingCircle.tsx
  //   - frontend/src/presentation/components/common/SlidePanel/SlidePanel.tsx
  //   - frontend/src/presentation/components/chat/ChatInput/ChatInput.tsx
  //   - frontend/src/presentation/components/chat/Message/Message.tsx
  //   - frontend/src/presentation/components/chat/MessageList/MessageList.tsx
  private readonly selectors = {
    // Floating chat button and slide panel
    floatingChatButton: '[data-testid="floating-chat-button"]',
    slidePanel: '[data-testid="slide-panel"]',
    slidePanelBackdrop: '[data-testid="slide-panel-backdrop"]',
    slidePanelCloseButton: '[data-testid="slide-panel-close-button"]',

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
   * Click the floating chat button to open the chat panel
   */
  openChatPanel(): this {
    this.click(this.selectors.floatingChatButton);
    // Wait for the slide panel to be open
    this.getElement(this.selectors.slidePanel).should('have.attr', 'data-open', 'true');
    return this;
  }

  /**
   * Close the chat panel
   */
  closeChatPanel(): this {
    this.click(this.selectors.slidePanelCloseButton);
    // Wait for the slide panel to be closed
    this.getElement(this.selectors.slidePanel).should('have.attr', 'data-open', 'false');
    return this;
  }

  /**
   * Verify the floating chat button is visible
   */
  verifyFloatingButtonVisible(): this {
    this.waitForElement(this.selectors.floatingChatButton);
    return this;
  }

  /**
   * Verify the chat panel is open
   */
  verifyChatPanelOpen(): this {
    this.getElement(this.selectors.slidePanel).should('have.attr', 'data-open', 'true');
    return this;
  }

  /**
   * Verify the chat panel is closed
   */
  verifyChatPanelClosed(): this {
    this.getElement(this.selectors.slidePanel).should('have.attr', 'data-open', 'false');
    return this;
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
    return this.getElement(`${this.selectors.messageListContainer} ${this.selectors.messageUserBubble}, ${this.selectors.messageListContainer} ${this.selectors.messageBotBubble}`)
      .then(($elements) => $elements.length);
  }

  /**
   * Get the last message text
   */
  getLastMessageText(): Cypress.Chainable<string> {
    return this.getElement(`${this.selectors.messageListContainer} ${this.selectors.messageBubble}`)
      .last()
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
   * Wait for new message to appear (either user or bot)
   */
  waitForNewMessage(timeoutMs: number = 10000): this {
    cy.get(`${this.selectors.messageUserBubble}, ${this.selectors.messageBotBubble}`, { timeout: timeoutMs })
      .should('exist');
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
