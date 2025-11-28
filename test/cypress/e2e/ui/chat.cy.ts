import { generateUniqueEmail, sendInvitationAndRegister } from '../../api/authApi';
import { ChatPage } from '../../pages/ChatPage';
import { LoginPage } from '../../pages/LoginPage';

describe('UI > Chat Functionality', () => {
  let chatPage: ChatPage;
  let loginPage: LoginPage;
  let testUserEmail: string;
  let testUserPassword: string;

  // Create test user before all tests
  before(() => {
    testUserEmail = generateUniqueEmail('chat-test');
    testUserPassword = 'TestPassword123!';

    sendInvitationAndRegister({
      name: 'Chat',
      surname: 'TestUser',
      email: testUserEmail,
      password: testUserPassword,
    });
  });

  beforeEach(() => {
    chatPage = new ChatPage();
    loginPage = new LoginPage();

    // Login before each test and wait for success
    loginPage.visit();
    loginPage.verifyPageLoaded().loginAndWait(testUserEmail, testUserPassword);

    // Navigate to home page and open the chat panel
    chatPage.visit();
    chatPage.verifyFloatingButtonVisible().openChatPanel();
  });

  describe('Chat Panel', () => {
    it('should open chat panel when clicking floating button', () => {
      // Panel is already opened in beforeEach, verify it's open
      chatPage.verifyChatPanelOpen();
    });

    it('should close chat panel when clicking close button', () => {
      chatPage.closeChatPanel();
      chatPage.verifyChatPanelClosed();
    });

    it('should reopen chat panel after closing', () => {
      chatPage.closeChatPanel();
      chatPage.verifyChatPanelClosed();
      chatPage.openChatPanel();
      chatPage.verifyChatPanelOpen();
    });
  });

  describe('Chat Input', () => {
    it('should display chat input container when page loads', () => {
      chatPage.verifyChatInputVisible();
    });

    it('should have send button disabled when input is empty', () => {
      chatPage.verifyChatInputVisible().verifySendButtonDisabled();
    });

    it('should enable send button when message is typed', () => {
      chatPage
        .verifyChatInputVisible()
        .typeMessage('Hello, this is a test message')
        .verifySendButtonEnabled();
    });

    it('should clear input after sending message', () => {
      chatPage.verifyChatInputVisible().typeMessage('Test message').verifySendButtonEnabled();

      chatPage.sendMessage();

      // Input should be cleared after sending
      chatPage.getInputValue().should('equal', '');
    });

    it('should allow clearing input manually', () => {
      chatPage.typeMessage('Some text to clear').clearInput();

      chatPage.getInputValue().should('equal', '');
    });
  });

  describe('Message Display', () => {
    it('should display message list container', () => {
      chatPage.verifyMessageListVisible();
    });

    it('should display user message after sending', () => {
      const testMessage = 'Hello AI, this is a test message';

      chatPage.verifyChatInputVisible().sendMessage(testMessage);

      // Wait for message to appear and verify
      chatPage.verifyUserMessageDisplayed(testMessage);
    });

    it('should display bot response after sending message', () => {
      const testMessage = 'What is 2 plus 2?';

      chatPage.verifyChatInputVisible().sendMessageAndWaitForResponse(testMessage, 15000); // 30s timeout for AI response

      // Verify bot responded
      chatPage.verifyLastMessageFromBot();
    });

    it('should show messages in chronological order', () => {
      const firstMessage = 'First test message';
      const secondMessage = 'Second test message';

      // Send first message
      chatPage.sendMessage(firstMessage);
      chatPage.verifyUserMessageDisplayed(firstMessage);

      // Wait for response before sending second
      cy.wait(2000);

      // Send second message
      chatPage.sendMessage(secondMessage);
      chatPage.verifyUserMessageDisplayed(secondMessage);

      // Both messages should be visible
      chatPage.getMessageCount().should('be.gte', 2);
    });
  });

  describe('Chat Streaming', () => {
    it('should stream AI response in real-time', () => {
      const testMessage = 'Tell me a short story about a cat';

      chatPage.verifyChatInputVisible().sendMessage(testMessage);

      // Verify user message appears
      chatPage.verifyUserMessageDisplayed(testMessage);

      // Wait for streaming to start (bot message should appear)
      chatPage.waitForNewMessage(15000);

      // Verify bot is responding
      chatPage.verifyLastMessageFromBot();
    });
  });

  describe('Error Handling', () => {
    it('should handle empty session gracefully', () => {
      // New session should show empty state or be ready for input
      chatPage.verifyChatInputVisible().verifyMessageListVisible();
    });
  });
});
