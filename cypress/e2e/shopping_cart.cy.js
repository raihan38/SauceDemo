import InventoryPage from '../pages/InventoryPage';
import CartPage from '../pages/CartPage';

describe('Shopping Cart', () => {
  beforeEach(() => {
    cy.loginAsStandardUser();
    InventoryPage.assertOnInventoryPage();
  });

  context('Adding items', () => {
    it('should update cart badge to 1 when adding a single item', () => {
      InventoryPage.addItemToCartByIndex(0);
      InventoryPage.assertCartBadge(1);
    });

    it('should update cart badge to 3 when adding multiple items', () => {
      InventoryPage.addItemToCartByIndex(0);
      InventoryPage.addItemToCartByIndex(1);
      InventoryPage.addItemToCartByIndex(2);
      InventoryPage.assertCartBadge(3);
    });

    it('should show all added items in the cart page', () => {
      cy.fixture('products').then((products) => {
        const itemsToAdd = products.knownProducts.slice(0, 3);

        itemsToAdd.forEach((product) => {
          InventoryPage.addItemToCartByName(product.name);
        });

        InventoryPage.goToCart();
        CartPage.assertOnCartPage();
        CartPage.assertItemCount(3);

        itemsToAdd.forEach((product) => {
          CartPage.assertItemInCart(product.name);
        });
      });
    });
  });

  context('Removing items', () => {
    it('should remove an item from cart and update badge', () => {
      cy.fixture('products').then((products) => {
        const firstProduct = products.knownProducts[0];
        const secondProduct = products.knownProducts[1];

        InventoryPage.addItemToCartByName(firstProduct.name);
        InventoryPage.addItemToCartByName(secondProduct.name);
        InventoryPage.assertCartBadge(2);

        InventoryPage.goToCart();
        CartPage.assertOnCartPage();

        CartPage.removeItemByName(firstProduct.name);
        CartPage.assertItemNotInCart(firstProduct.name);
        CartPage.assertItemInCart(secondProduct.name);
        CartPage.assertItemCount(1);
      });
    });

    it('should remove cart badge when all items are removed', () => {
      InventoryPage.addItemToCartByIndex(0);
      InventoryPage.assertCartBadge(1);

      InventoryPage.goToCart();
      CartPage.assertOnCartPage();

      cy.get('.cart_item button').click();
      InventoryPage.assertCartBadgeNotExists();
    });
  });

  context('Cart persistence', () => {
    it('should persist cart items after navigating away and back', () => {
      cy.fixture('products').then((products) => {
        const product = products.knownProducts[0];

        InventoryPage.addItemToCartByName(product.name);
        InventoryPage.assertCartBadge(1);

        // Navigate to cart
        InventoryPage.goToCart();
        CartPage.assertOnCartPage();
        CartPage.assertItemInCart(product.name);

        // Navigate back to inventory
        CartPage.continueShopping();
        InventoryPage.assertOnInventoryPage();
        InventoryPage.assertCartBadge(1);

        // Go back to cart again
        InventoryPage.goToCart();
        CartPage.assertItemInCart(product.name);
      });
    });
  });

  context('Price consistency', () => {
    it('should show matching names and prices between inventory and cart', () => {
      cy.fixture('products').then((products) => {
        const product = products.knownProducts[0]; // Sauce Labs Backpack

        InventoryPage.addItemToCartByName(product.name);
        InventoryPage.goToCart();
        CartPage.assertOnCartPage();

        // Verify name matches
        CartPage.assertItemInCart(product.name);

        // Verify price matches fixture data
        cy.get('.cart_item .inventory_item_price')
          .should('have.text', `$${product.price}`);
      });
    });
  });
});
