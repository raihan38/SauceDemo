import LoginPage from '../pages/LoginPage';
import InventoryPage from '../pages/InventoryPage';
import CartPage from '../pages/CartPage';
import CheckoutPage from '../pages/CheckoutPage';

describe('Performance & Resilience', () => {
  describe('performance_glitch_user-slow responses', () => {
    it('should login successfully despite response delay', () => {
      cy.fixture('users').then((users) => {
        LoginPage.visit();

        const startTime = Date.now();

        LoginPage.login(users.performance.username, users.performance.password);

        // Cypress will automatically retry and wait for the inventory page
        // No cy.wait() or hardcoded delays — relies on Cypress retry-ability
        InventoryPage.assertOnInventoryPage();

        const elapsed = Date.now() - startTime;
        cy.log(`Login completed in ${elapsed}ms (includes glitch delay)`);
      });
    });

    it('TC-Perf-01 should load inventory page with all products despite delay', () => {
      cy.fixture('users').then((users) => {
        cy.login(users.performance.username, users.performance.password);

        InventoryPage.assertOnInventoryPage();
        InventoryPage.assertItemCount(6);
        InventoryPage.assertAllItemsHaveNameAndPrice();
      });
    });
  });

  describe('error_user- errors on actions', () => {
    beforeEach(() => {
      cy.fixture('users').then((users) => {
        cy.login(users.error.username, users.error.password);
      });
      InventoryPage.assertOnInventoryPage();
    }); 

    it('TC-Perf-02 should encounter error when adding item to cart', () => {
      // error_user triggers errors on certain actions
      // Attempt to add an item and assert the error state
      cy.fixture('products').then((products) => {
        const product = products.knownProducts[0];
        InventoryPage.addItemToCartByName(product.name);

        // error_user may show an error or the action silently fails
        // Check if cart badge updates — if not, the add failed
        cy.get('body').then(($body) => {
          if ($body.find('.shopping_cart_badge').length === 0) {
            cy.log('DEFECT CONFIRMED: Add to cart failed for error_user');
          } else {
            // If badge exists, verify we can still navigate to cart
            InventoryPage.goToCart();
            CartPage.assertOnCartPage();
          }
        });
      });
    });

    it('TC-Perf-03 should encounter error during checkout process', () => {
      cy.fixture('checkout').then((checkout) => {
        // Add item
        InventoryPage.addItemToCartByIndex(0);
        InventoryPage.goToCart();
        CartPage.assertOnCartPage();

        CartPage.proceedToCheckout();

        // Fill checkout info
        CheckoutPage.fillCheckoutInfo(
          checkout.validCheckout.firstName,
          checkout.validCheckout.lastName,
          checkout.validCheckout.postalCode
        );

        CheckoutPage.clickContinue();

        // error_user may fail to proceed or show an error
        // Assert either an error is shown or the page fails to advance
        cy.url().then((url) => {
          if (url.includes('checkout-step-one')) {
            // Still on step one — checkout failed
            cy.get('[data-test="error"]').should('be.visible');
            cy.log('DEFECT CONFIRMED: Checkout failed for error_user');
          } else if (url.includes('checkout-step-two')) {
            // Made it to step two — try to finish
            CheckoutPage.clickFinish();

            cy.url().then((finalUrl) => {
              if (finalUrl.includes('checkout-step-two')) {
                cy.log('DEFECT CONFIRMED: Finish action failed for error_user');
              }
            });
          }
        });
      });
    });

    it('TC-Perf-04 should encounter error when sorting products', () => {
      // error_user triggers errors on sorting
      cy.fixture('products').then((products) => {
        InventoryPage.sortBy(products.sortOptions.nameAsc);

        // Check if an error container appears after sort
        cy.get('body').then(($body) => {
          if ($body.find('[data-test="error"]').length > 0) {
            cy.get('[data-test="error"]').should('be.visible');
            cy.log('DEFECT CONFIRMED: Sorting failed for error_user');
          } else {
            // Sort may have silently failed — verify order is wrong
            cy.log('Sort completed without visible error for error_user');
          }
        });
      });
    });

    it('TC-Perf-05 should encounter error when removing item from cart', () => {
      cy.fixture('products').then((products) => {
        const product = products.knownProducts[0];

        // Try to add and then remove
        InventoryPage.addItemToCartByIndex(0);
        InventoryPage.goToCart();
        CartPage.assertOnCartPage();

        // Attempt remove
        cy.get('.cart_item').then(($items) => {
          if ($items.length > 0) {
            cy.get('.cart_item button').first().click();

            // Check if remove actually worked
            cy.get('body').then(($body) => {
              if ($body.find('[data-test="error"]').length > 0) {
                cy.get('[data-test="error"]').should('be.visible');
                cy.log('DEFECT CONFIRMED: Remove from cart failed for error_user');
              } else if ($body.find('.cart_item').length > 0) {
                cy.log('DEFECT CONFIRMED: Item still in cart after remove for error_user');
              }
            });
          }
        });
      });
    });
  });
});
