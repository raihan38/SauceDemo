class CartPage {
  // Selectors
  get cartContainer() { return '#cart_contents_container'; }
  get cartItems() { return '.cart_item'; }
  get cartItemNames() { return '.inventory_item_name'; }
  get cartItemPrices() { return '.inventory_item_price'; }
  get continueShoppingButton() { return '[data-test="continue-shopping"]'; }
  get checkoutButton() { return '[data-test="checkout"]'; }

  assertOnCartPage() {
    cy.get(this.cartContainer).should('be.visible');
    cy.url().should('include', '/cart.html');
    return this;
  }

  assertItemCount(count) {
    if (count === 0) {
      cy.get(this.cartItems).should('not.exist');
    } else {
      cy.get(this.cartItems).should('have.length', count);
    }
    return this;
  }

  assertItemInCart(productName) {
    cy.get(this.cartItemNames).should('contain.text', productName);
    return this;
  }

  assertItemNotInCart(productName) {
    cy.get(this.cartContainer).should('not.contain.text', productName);
    return this;
  }

  removeItemByName(productName) {
    const buttonId = `remove-${productName.toLowerCase().replace(/[() ]/g, '-').replace(/--/g, '-')}`;
    cy.get(`[data-test="${buttonId}"]`).click();
    return this;
  }

  getCartItemNames() {
    const names = [];
    return cy.get(this.cartItemNames).each(($el) => {
      names.push($el.text());
    }).then(() => names);
  }

  continueShopping() {
    cy.get(this.continueShoppingButton).click();
    return this;
  }

  proceedToCheckout() {
    cy.get(this.checkoutButton).click();
    return this;
  }
}

export default new CartPage();
