class InventoryPage {
  // Selectors
  get inventoryContainer() { return '#inventory_container'; }
  get inventoryItems() { return '.inventory_item'; }
  get itemNames() { return '.inventory_item_name'; }
  get itemPrices() { return '.inventory_item_price'; }
  get itemImages() { return '.inventory_item_img img'; }
  get sortDropdown() { return '[data-test="product-sort-container"]'; }
  get cartBadge() { return '.shopping_cart_badge'; }
  get cartLink() { return '.shopping_cart_link'; }
  get burgerMenu() { return '#react-burger-menu-btn'; }
  get logoutLink() { return '#logout_sidebar_link'; }
  get closeBurgerMenu() { return '#react-burger-cross-btn'; }

  assertOnInventoryPage() {
    cy.get(this.inventoryContainer).should('be.visible');
    cy.url().should('include', '/inventory.html');
    return this;
  }

  getItemCount() {
    return cy.get(this.inventoryItems).its('length');
  }

  assertItemCount(count) {
    cy.get(this.inventoryItems).should('have.length', count);
    return this;
  }

  assertAllItemsHaveNameAndPrice() {
    cy.get(this.inventoryItems).each(($item) => {
      cy.wrap($item).find('.inventory_item_name').should('be.visible').and('not.be.empty');
      cy.wrap($item).find('.inventory_item_price').should('be.visible').and('not.be.empty');
    });
    return this;
  }

  sortBy(optionValue) {
    cy.get(this.sortDropdown).select(optionValue);
    return this;
  }

  getItemNames() {
    const names = [];
    return cy.get(this.itemNames).each(($el) => {
      names.push($el.text());
    }).then(() => names);
  }

  getItemPrices() {
    const prices = [];
    return cy.get(this.itemPrices).each(($el) => {
      const price = parseFloat($el.text().replace('$', ''));
      prices.push(price);
    }).then(() => prices);
  }

  getItemImageSources() {
    const sources = [];
    return cy.get(this.itemImages).each(($el) => {
      sources.push($el.attr('src'));
    }).then(() => sources);
  }

  addItemToCartByIndex(index) {
    cy.get(this.inventoryItems)
      .eq(index)
      .find('button')
      .contains('Add to cart')
      .click();
    return this;
  }

  addItemToCartByName(productName) {
    const buttonId = `add-to-cart-${productName.toLowerCase().replace(/[() ]/g, '-').replace(/--/g, '-')}`;
    cy.get(`[data-test="${buttonId}"]`).click();
    return this;
  }

  removeItemByName(productName) {
    const buttonId = `remove-${productName.toLowerCase().replace(/[() ]/g, '-').replace(/--/g, '-')}`;
    cy.get(`[data-test="${buttonId}"]`).click();
    return this;
  }

  assertCartBadge(count) {
    cy.get(this.cartBadge).should('have.text', String(count));
    return this;
  }

  assertCartBadgeNotExists() {
    cy.get(this.cartBadge).should('not.exist');
    return this;
  }

  goToCart() {
    cy.get(this.cartLink).click();
    return this;
  }

  openBurgerMenu() {
    cy.get(this.burgerMenu).click();
    return this;
  }

  logout() {
    this.openBurgerMenu();
    cy.get(this.logoutLink).should('be.visible').click();
    return this;
  }
}

export default new InventoryPage();
