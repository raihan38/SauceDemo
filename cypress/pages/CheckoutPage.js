class CheckoutPage {
  // Step One selectors
  get firstNameInput() { return '[data-test="firstName"]'; }
  get lastNameInput() { return '[data-test="lastName"]'; }
  get postalCodeInput() { return '[data-test="postalCode"]'; }
  get continueButton() { return '[data-test="continue"]'; }
  get cancelButton() { return '[data-test="cancel"]'; }
  get errorMessage() { return '[data-test="error"]'; }

  // Step Two (Overview) selectors
  get summaryContainer() { return '#checkout_summary_container'; }
  get summaryItems() { return '.cart_item'; }
  get subtotalLabel() { return '.summary_subtotal_label'; }
  get taxLabel() { return '.summary_tax_label'; }
  get totalLabel() { return '.summary_total_label'; }
  get finishButton() { return '[data-test="finish"]'; }

  assertOnStepOne() {
    cy.url().should('include', '/checkout-step-one.html');
    cy.get(this.firstNameInput).should('be.visible');
    return this;
  }

  assertOnStepTwo() {
    cy.url().should('include', '/checkout-step-two.html');
    cy.get(this.summaryContainer).should('be.visible');
    return this;
  }

  fillCheckoutInfo(firstName, lastName, postalCode) {
    if (firstName) {
      cy.get(this.firstNameInput).clear().type(firstName);
    }
    if (lastName) {
      cy.get(this.lastNameInput).clear().type(lastName);
    }
    if (postalCode) {
      cy.get(this.postalCodeInput).clear().type(postalCode);
    }
    return this;
  }

  clickContinue() {
    cy.get(this.continueButton).click();
    return this;
  }

  assertErrorVisible(expectedText) {
    cy.get(this.errorMessage).should('be.visible').and('contain.text', expectedText);
    return this;
  }

  getSubtotal() {
    return cy.get(this.subtotalLabel).invoke('text').then((text) => {
      return parseFloat(text.replace('Item total: $', ''));
    });
  }

  getTax() {
    return cy.get(this.taxLabel).invoke('text').then((text) => {
      return parseFloat(text.replace('Tax: $', ''));
    });
  }

  getTotal() {
    return cy.get(this.totalLabel).invoke('text').then((text) => {
      return parseFloat(text.replace('Total: $', ''));
    });
  }

  verifyOrderMath() {
    let subtotal, tax;
    this.getSubtotal().then((s) => {
      subtotal = s;
      return this.getTax();
    }).then((t) => {
      tax = t;
      return this.getTotal();
    }).then((total) => {
      const expectedTotal = Math.round((subtotal + tax) * 100) / 100;
      expect(total).to.equal(expectedTotal);
    });
    return this;
  }

  clickFinish() {
    cy.get(this.finishButton).click();
    return this;
  }
}

export default new CheckoutPage();
