/**
 * UI Helper Functions
 * Common utilities for UI interactions
 */

/**
 * Wait for page to fully load
 */
export const waitForPageLoad = (): void => {
  cy.document().should('have.property', 'readyState', 'complete');
};

/**
 * Check if element is visible in viewport
 * @param selector - CSS selector
 */
export const isInViewport = (selector: string): Cypress.Chainable<boolean> => {
  return cy.window().then((win) => {
    return cy.get(selector).then(($el) => {
      const rect = $el[0].getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (win.innerHeight || win.document.documentElement.clientHeight) &&
        rect.right <= (win.innerWidth || win.document.documentElement.clientWidth)
      );
    });
  });
};

/**
 * Get element text content
 * @param selector - CSS selector
 */
export const getTextContent = (selector: string): Cypress.Chainable<string> => {
  return cy.get(selector).invoke('text');
};

/**
 * Get element attribute value
 * @param selector - CSS selector
 * @param attribute - Attribute name
 */
export const getAttributeValue = (
  selector: string,
  attribute: string
): Cypress.Chainable<string> => {
  return cy.get(selector).invoke('attr', attribute);
};

/**
 * Click element with force option (for hidden/covered elements)
 * @param selector - CSS selector
 */
export const forceClick = (selector: string): void => {
  cy.get(selector).click({ force: true });
};

/**
 * Double click element
 * @param selector - CSS selector
 */
export const doubleClick = (selector: string): void => {
  cy.get(selector).dblclick();
};

/**
 * Right click element
 * @param selector - CSS selector
 */
export const rightClick = (selector: string): void => {
  cy.get(selector).rightclick();
};

/**
 * Hover over element
 * @param selector - CSS selector
 */
export const hover = (selector: string): void => {
  cy.get(selector).trigger('mouseover');
};

/**
 * Get element count
 * @param selector - CSS selector
 */
export const getElementCount = (selector: string): Cypress.Chainable<number> => {
  return cy.get(selector).its('length');
};

/**
 * Check if element has class
 * @param selector - CSS selector
 * @param className - Class name to check
 */
export const hasClass = (selector: string, className: string): Cypress.Chainable<boolean> => {
  return cy.get(selector).then(($el) => $el.hasClass(className));
};

/**
 * Get element CSS property value
 * @param selector - CSS selector
 * @param property - CSS property name
 */
export const getCssProperty = (selector: string, property: string): Cypress.Chainable<string> => {
  return cy.get(selector).invoke('css', property);
};

/**
 * Select option by visible text
 * @param selector - CSS selector for select element
 * @param text - Visible text to select
 */
export const selectByText = (selector: string, text: string): void => {
  cy.get(selector).select(text);
};

/**
 * Select option by index
 * @param selector - CSS selector for select element
 * @param index - Index to select
 */
export const selectByIndex = (selector: string, index: number): void => {
  cy.get(selector).select(index);
};

/**
 * Clear input and verify it's empty
 * @param selector - CSS selector
 */
export const clearAndVerify = (selector: string): void => {
  cy.get(selector).clear();
  cy.get(selector).should('have.value', '');
};

/**
 * Type with delay between keystrokes
 * @param selector - CSS selector
 * @param text - Text to type
 * @param delay - Delay in milliseconds
 */
export const typeWithDelay = (selector: string, text: string, delay: number = 100): void => {
  cy.get(selector).type(text, { delay });
};

/**
 * Press keyboard key
 * @param selector - CSS selector
 * @param key - Key to press (e.g., 'Enter', 'Escape')
 */
export const pressKey = (selector: string, key: string): void => {
  cy.get(selector).type(`{${key}}`);
};

/**
 * Take screenshot with timestamp
 * @param name - Screenshot name
 */
export const takeTimestampedScreenshot = (name: string): void => {
  const timestamp = new Date().getTime();
  cy.url().should('exist');
  cy.screenshot(`${name}-${timestamp}`);
};

/**
 * Wait for animation to complete
 * @param selector - CSS selector
 */
export const waitForAnimation = (selector: string): void => {
  cy.get(selector).should('not.have.css', 'animation-name', 'none');
  cy.get(selector).should('have.css', 'animation-name', 'none');
};

/**
 * Scroll to top of page
 */
export const scrollToTop = (): void => {
  cy.scrollTo('top');
};

/**
 * Scroll to bottom of page
 */
export const scrollToBottom = (): void => {
  cy.scrollTo('bottom');
};

/**
 * Scroll to specific position
 * @param x - X coordinate
 * @param y - Y coordinate
 */
export const scrollToPosition = (x: number, y: number): void => {
  cy.scrollTo(x, y);
};

/**
 * Get window object
 */
export const getWindow = (): Cypress.Chainable<Cypress.AUTWindow> => {
  return cy.window();
};

/**
 * Get document object
 */
export const getDocument = (): Cypress.Chainable<Document> => {
  return cy.document();
};

/**
 * Reload page and wait for load
 */
export const reloadAndWait = (): void => {
  cy.reload();
  waitForPageLoad();
};

/**
 * Check if checkbox or radio button is checked
 * @param selector - CSS selector
 */
export const isChecked = (selector: string): Cypress.Chainable<boolean> => {
  return cy.get(selector).should('be.checked').then(() => true);
};

/**
 * Toggle checkbox
 * @param selector - CSS selector
 */
export const toggleCheckbox = (selector: string): void => {
  cy.get(selector).then(($checkbox) => {
    if ($checkbox.is(':checked')) {
      cy.wrap($checkbox).uncheck();
    } else {
      cy.wrap($checkbox).check();
    }
  });
};

/**
 * Drag and drop element
 * @param sourceSelector - Source element selector
 * @param targetSelector - Target element selector
 */
export const dragAndDrop = (sourceSelector: string, targetSelector: string): void => {
  cy.get(sourceSelector).trigger('dragstart');
  cy.get(targetSelector).trigger('drop');
};
