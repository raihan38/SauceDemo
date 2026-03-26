/**
 * Custom command: Login with given credentials
 * Performs login via the UI — reusable across all test suites
 */
Cypress.Commands.add('login', (username, password) => {
  cy.visit('/');
  cy.get('#user-name').clear().type(username);
  cy.get('#password').clear().type(password);
  cy.get('#login-button').click();
});

/**
 * Custom command: Login with standard_user credentials
 * Shortcut for the most common login scenario
 */
Cypress.Commands.add('loginAsStandardUser', () => {
  cy.fixture('users').then((users) => {
    cy.login(users.standard.username, users.standard.password);
  });
});

/**
 * Custom command: Add product to cart by name from inventory page
 * Constructs the data-test selector dynamically from product name
 */
Cypress.Commands.add('addToCart', (productName) => {
  const buttonId = `add-to-cart-${productName.toLowerCase().replace(/[() ]/g, '-').replace(/--/g, '-')}`;
  cy.get(`[data-test="${buttonId}"]`).click();
});

/**
 * Custom command: Assert cart badge count
 */
Cypress.Commands.add('assertCartCount', (count) => {
  if (count === 0) {
    cy.get('.shopping_cart_badge').should('not.exist');
  } else {
    cy.get('.shopping_cart_badge').should('have.text', String(count));
  }
});

/**
 * Custom command: Complete full checkout with given info
 */
Cypress.Commands.add('fillCheckout', (firstName, lastName, postalCode) => {
  if (firstName) cy.get('[data-test="firstName"]').clear().type(firstName);
  if (lastName) cy.get('[data-test="lastName"]').clear().type(lastName);
  if (postalCode) cy.get('[data-test="postalCode"]').clear().type(postalCode);
  cy.get('[data-test="continue"]').click();
});
