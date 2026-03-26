class LoginPage {
  // Selectors
  get usernameInput() { return '#user-name'; }
  get passwordInput() { return '#password'; }
  get loginButton() { return '#login-button'; }
  get errorMessage() { return '[data-test="error"]'; }
  get errorCloseButton() { return '.error-button'; }

  visit() {
    cy.visit('/');
    return this;
  }

  fillUsername(username) {
    cy.get(this.usernameInput).clear().type(username);
    return this;
  }

  fillPassword(password) {
    cy.get(this.passwordInput).clear().type(password);
    return this;
  }

  clickLogin() {
    cy.get(this.loginButton).click();
    return this;
  }

  login(username, password) {
    this.fillUsername(username);
    this.fillPassword(password);
    this.clickLogin();
    return this;
  }

  submitEmpty() {
    cy.get(this.loginButton).click();
    return this;
  }

  submitWithUsernameOnly(username) {
    this.fillUsername(username);
    this.clickLogin();
    return this;
  }

  submitWithPasswordOnly(password) {
    this.fillPassword(password);
    this.clickLogin();
    return this;
  }

  getErrorText() {
    return cy.get(this.errorMessage);
  }

  assertErrorVisible(expectedText) {
    this.getErrorText().should('be.visible').and('contain.text', expectedText);
    return this;
  }

  assertOnLoginPage() {
    cy.get(this.loginButton).should('be.visible');
    cy.url().should('eq', Cypress.config('baseUrl') + '/');
    return this;
  }
}

export default new LoginPage();
