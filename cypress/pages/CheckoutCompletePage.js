class CheckoutCompletePage {
  get completeContainer() { return '#checkout_complete_container'; }
  get completeHeader() { return '.complete-header'; }
  get completeText() { return '.complete-text'; }
  get backHomeButton() { return '[data-test="back-to-products"]'; }
  get ponyExpressImage() { return '.pony_express'; }

  assertOnCompletePage() {
    cy.url().should('include', '/checkout-complete.html');
    cy.get(this.completeContainer).should('be.visible');
    return this;
  }

  assertOrderConfirmation() {
    cy.get(this.completeHeader).should('have.text', 'Thank you for your order!');
    cy.get(this.completeText).should('be.visible');
    cy.get(this.ponyExpressImage).should('be.visible');
    return this;
  }

  clickBackHome() {
    cy.get(this.backHomeButton).click();
    return this;
  }
}

export default new CheckoutCompletePage();
