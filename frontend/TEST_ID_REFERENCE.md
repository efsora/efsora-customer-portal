# Test ID Reference Guide

Complete guide to `data-testid` attributes for all frontend components. Use this guide when adding test IDs to new or existing components.

## Naming Convention

```
data-testid="[section]-[component]-[element]"

Examples:
- login-form-email-input
- chat-input-send-button
- users-table-row
- dashboard-milestone-item
```

---

## ✅ COMPLETED - Components with Test IDs

### Auth Components

**LoginForm.tsx**
```
login-page-container
login-form-wrapper
login-form-title
login-form
login-form-error-alert
login-form-error-message
login-form-inputs-container
login-form-email-field
login-form-email-input
login-form-email-error
login-form-password-field
login-form-password-input
login-form-password-error
login-form-submit-container
login-form-submit-button
login-form-signup-section
login-form-signup-link
```

**RegisterForm.tsx**
```
register-page-container
register-form-wrapper
register-form-title
register-form
register-form-error-alert
register-form-error-message
register-form-inputs-container
register-form-name-field
register-form-name-input
register-form-name-error
register-form-email-field
register-form-email-input
register-form-email-error
register-form-password-field
register-form-password-input
register-form-password-error
register-form-confirm-password-field
register-form-confirm-password-input
register-form-confirm-password-error
register-form-submit-container
register-form-submit-button
register-form-signin-section
register-form-signin-link
```

### Chat Components

**ChatInput.tsx**
```
chat-input-container
chat-input-wrapper
chat-input-field
chat-input-send-button
```

**Message.tsx**
```
chat-message-user              (for user messages)
chat-message-bot               (for bot messages)
chat-message-wrapper
chat-message-author
chat-message-bubble
chat-message-timestamp
```

**MessageList.tsx**
```
chat-message-list-container
chat-message-list-empty
chat-message-item-{index}      (e.g., chat-message-item-0, chat-message-item-1)
chat-message-list-loading
chat-message-list-scroll-anchor
```

---

## 🔄 TODO - Components Needing Test IDs

### Form Components

#### CreateUserForm.tsx
**Suggested Test IDs:**
```
users-create-form
users-create-form-name-input
users-create-form-email-input
users-create-form-password-input
users-create-form-submit-button
users-create-form-cancel-button
users-create-form-error-alert
```

#### TextInput.tsx (Reusable)
**Suggested Test IDs:**
```
text-input-{fieldName}          (e.g., text-input-email, text-input-username)
text-input-{fieldName}-error
text-input-{fieldName}-label
```

### Data Display Components

#### Table.tsx
**Suggested Test IDs:**
```
table-container
table-header
table-header-row
table-header-cell-{columnName}  (e.g., table-header-cell-name, table-header-cell-email)
table-body
table-row-{rowIndex}            (e.g., table-row-0, table-row-1)
table-cell-{columnName}-{rowIndex}
table-sort-button-{columnName}
```

#### GetAllUsers.tsx
**Suggested Test IDs:**
```
users-page-container
users-table-container
users-table-loading
users-table-empty
users-table-search-input
users-table-filter-button
users-table-row-{userId}
users-table-row-{userId}-edit-button
users-table-row-{userId}-delete-button
users-table-row-{userId}-view-button
users-create-button
users-pagination-container
users-pagination-prev
users-pagination-next
users-pagination-page-{pageNumber}
```

#### DetailedUser.tsx
**Suggested Test IDs:**
```
user-detail-container
user-detail-header
user-detail-name
user-detail-email
user-detail-created-at
user-detail-updated-at
user-detail-edit-button
user-detail-delete-button
user-detail-back-button
```

#### SummaryUser.tsx
**Suggested Test IDs:**
```
user-summary-card
user-summary-avatar
user-summary-name
user-summary-email
user-summary-action-button
```

#### UserProfile.tsx
**Suggested Test IDs:**
```
user-profile-menu
user-profile-avatar
user-profile-name
user-profile-email
user-profile-edit-option
user-profile-settings-option
user-profile-logout-option
```

### Navigation & Selection Components

#### NavigationMenu.tsx
**Suggested Test IDs:**
```
navigation-menu-container
navigation-menu-item-{itemName}         (e.g., navigation-menu-item-dashboard)
navigation-menu-link-{route}
navigation-menu-active-item
```

#### Dropdown.tsx
**Suggested Test IDs:**
```
dropdown-trigger
dropdown-trigger-{componentName}        (e.g., dropdown-trigger-language)
dropdown-menu
dropdown-menu-item
dropdown-menu-item-{itemName}
dropdown-menu-item-{itemName}-button
```

#### LanguageSelect.tsx
**Suggested Test IDs:**
```
language-select-trigger
language-select-menu
language-select-item-{languageCode}    (e.g., language-select-item-en, language-select-item-es)
language-select-current
```

#### PageTitle.tsx
**Suggested Test IDs:**
```
page-title-container
page-title-heading
page-title-description
page-title-breadcrumb
```

#### Tag.tsx (Reusable)
**Suggested Test IDs:**
```
tag-{tagName}
tag-{tagName}-close-button
tag-container
```

### Dashboard Components

#### Dashboard.tsx
**Suggested Test IDs:**
```
dashboard-page-container
dashboard-section-overview
dashboard-section-metrics
dashboard-section-activities
dashboard-widget-{widgetName}
```

#### CurrentMilestone.tsx
**Suggested Test IDs:**
```
milestone-container
milestone-timeline
milestone-timeline-item-{index}
milestone-current-item
milestone-progress-bar
```

#### ActiveMilestone.tsx
**Suggested Test IDs:**
```
active-milestone-card
active-milestone-title
active-milestone-description
active-milestone-progress-percentage
active-milestone-status
active-milestone-details-button
```

#### QuickAccess.tsx
**Suggested Test IDs:**
```
quick-access-container
quick-access-tile-{tileName}           (e.g., quick-access-tile-create-user)
quick-access-tile-{tileName}-button
quick-access-tile-icon
quick-access-tile-label
```

### Layout Components

#### Layout.tsx
**Suggested Test IDs:**
```
layout-container
layout-header
layout-sidebar-left
layout-sidebar-right
layout-main-content
layout-footer
```

#### Header.tsx
**Suggested Test IDs:**
```
header-container
header-logo
header-search-input
header-user-menu
header-notifications
header-settings-button
```

#### LeftBar.tsx
**Suggested Test IDs:**
```
leftbar-container
leftbar-logo
leftbar-brand-name
leftbar-navigation
leftbar-collapse-button
```

#### RightBar.tsx
**Suggested Test IDs:**
```
rightbar-container
rightbar-content
rightbar-close-button
```

#### Footer.tsx
**Suggested Test IDs:**
```
footer-container
footer-copyright
footer-links
footer-link-{linkName}
```

#### SlidePanel.tsx
**Suggested Test IDs:**
```
slide-panel-overlay
slide-panel-container
slide-panel-header
slide-panel-title
slide-panel-close-button
slide-panel-content
slide-panel-footer
```

#### Tooltip.tsx
**Suggested Test IDs:**
```
tooltip-trigger
tooltip-content
tooltip-arrow
```

### Utility Components

#### Logout.tsx
**Suggested Test IDs:**
```
logout-button
logout-confirmation-dialog
logout-confirmation-message
logout-confirm-button
logout-cancel-button
```

#### FloatingCircle.tsx
**Suggested Test IDs:**
```
floating-circle-button
floating-circle-menu
floating-circle-menu-item-{itemName}
```

#### NotificationProvider.tsx
**Suggested Test IDs:**
```
notification-toast
notification-toast-{toastId}
notification-toast-message
notification-toast-close-button
```

---

## 📋 Page Level Test IDs

All page components should have root container test IDs:

```
{pageName}-page
{pageName}-page-container
{pageName}-page-loading
{pageName}-page-error
```

**Examples:**
```
login-page
register-page
dashboard-page
users-page
timeline-page
documents-page
yourteam-page
```

---

## 🎯 POM Test ID Selector Mapping

When updating Page Object Models, use these selectors:

```typescript
// Auth POMs
private readonly selectors = {
  // Login
  emailInput: '[data-testid="login-form-email-input"]',
  passwordInput: '[data-testid="login-form-password-input"]',
  submitButton: '[data-testid="login-form-submit-button"]',
  errorMessage: '[data-testid="login-form-error-message"]',
  signUpLink: '[data-testid="login-form-signup-link"]',

  // Register
  nameInput: '[data-testid="register-form-name-input"]',
  registerSubmitButton: '[data-testid="register-form-submit-button"]',
};

// Chat POMs
private readonly selectors = {
  messageInput: '[data-testid="chat-input-field"]',
  sendButton: '[data-testid="chat-input-send-button"]',
  messageList: '[data-testid="chat-message-list-container"]',
  messageItem: '[data-testid*="chat-message-item-"]',
};

// User Table POMs
private readonly selectors = {
  table: '[data-testid="table-container"]',
  rows: '[data-testid*="table-row-"]',
  headers: '[data-testid*="table-header-cell-"]',
  searchInput: '[data-testid="users-table-search-input"]',
};
```

---

## 🔧 Implementation Checklist

When adding test IDs to a new component:

- [ ] Identify all interactive elements (inputs, buttons, links)
- [ ] Identify all data display elements (lists, tables, cards)
- [ ] Identify all container/section elements
- [ ] Add data-testid to each element following naming convention
- [ ] Update related POM selectors
- [ ] Test selectors work in Cypress
- [ ] Document in this file if component is critical for E2E tests

---

## 📚 Additional Resources

- **Cypress Best Practices**: https://docs.cypress.io/guides/references/best-practices
- **Testing Library Docs**: https://testing-library.com/docs/dom-testing-library/api-queries
- **data-testid Convention**: https://kentcdodds.com/blog/making-your-ui-tests-resilient-to-css-changes

---

**Last Updated**: November 2025
**Test IDs Completed**: 5 components
**Test IDs Remaining**: 23 components
