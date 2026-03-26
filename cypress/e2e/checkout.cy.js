import InventoryPage from '../pages/InventoryPage';
import CartPage from '../pages/CartPage';
import CheckoutPage from '../pages/CheckoutPage';
import CheckoutCompletePage from '../pages/CheckoutCompletePage';

describe('Checkout Flow', () => {
  beforeEach(() => {
    cy.loginAsStandardUser();
    InventoryPage.assertOnInventoryPage();
  });

  describe('Complete purchase — happy path', () => {
    it('should complete a full purchase and show confirmation', () => {
      cy.fixture('checkout').then((checkout) => {
        // Add item to cart
        InventoryPage.addItemToCartByIndex(0);
        InventoryPage.goToCart();
        CartPage.assertOnCartPage();

        // Proceed to checkout
        CartPage.proceedToCheckout();
        CheckoutPage.assertOnStepOne();

        // Fill checkout info
        CheckoutPage.fillCheckoutInfo(
          checkout.validCheckout.firstName,
          checkout.validCheckout.lastName,
          checkout.validCheckout.postalCode
        );
        CheckoutPage.clickContinue();

        // Verify overview page
        CheckoutPage.assertOnStepTwo();

        // Finish order
        CheckoutPage.clickFinish();

        // Verify confirmation
        CheckoutCompletePage.assertOnCompletePage();
        CheckoutCompletePage.assertOrderConfirmation();
      });
    });

    it('should return to inventory after clicking Back Home', () => {
      cy.fixture('checkout').then((checkout) => {
        InventoryPage.addItemToCartByIndex(0);
        InventoryPage.goToCart();
        CartPage.proceedToCheckout();
        CheckoutPage.fillCheckoutInfo(
          checkout.validCheckout.firstName,
          checkout.validCheckout.lastName,
          checkout.validCheckout.postalCode
        );
        CheckoutPage.clickContinue();
        CheckoutPage.clickFinish();
        CheckoutCompletePage.assertOnCompletePage();

        CheckoutCompletePage.clickBackHome();
        InventoryPage.assertOnInventoryPage();
      });
    });
  });

  describe('Checkout validation — missing fields', () => {
    beforeEach(() => {
      InventoryPage.addItemToCartByIndex(0);
      InventoryPage.goToCart();
      CartPage.proceedToCheckout();
      CheckoutPage.assertOnStepOne();
    });

    it('should show error when first name is missing', () => {
      cy.fixture('checkout').then((checkout) => {
        CheckoutPage.fillCheckoutInfo(
          null,
          checkout.missingFirstName.lastName,
          checkout.missingFirstName.postalCode
        );
        CheckoutPage.clickContinue();
        CheckoutPage.assertErrorVisible(checkout.errorMessages.firstNameRequired);
      });
    });

    it('should show error when last name is missing', () => {
      cy.fixture('checkout').then((checkout) => {
        CheckoutPage.fillCheckoutInfo(
          checkout.missingLastName.firstName,
          null,
          checkout.missingLastName.postalCode
        );
        CheckoutPage.clickContinue();
        CheckoutPage.assertErrorVisible(checkout.errorMessages.lastNameRequired);
      });
    });

    it('should show error when postal code is missing', () => {
      cy.fixture('checkout').then((checkout) => {
        CheckoutPage.fillCheckoutInfo(
          checkout.missingPostalCode.firstName,
          checkout.missingPostalCode.lastName,
          null
        );
        CheckoutPage.clickContinue();
        CheckoutPage.assertErrorVisible(checkout.errorMessages.postalCodeRequired);
      });
    });
  });

  describe('Order summary — math verification', () => {
    it('should have item subtotal + tax equal to total', () => {
      cy.fixture('checkout').then((checkout) => {
        // Add multiple items for a more meaningful math check
        InventoryPage.addItemToCartByIndex(0);
        InventoryPage.addItemToCartByIndex(1);
        InventoryPage.goToCart();
        CartPage.proceedToCheckout();

        CheckoutPage.fillCheckoutInfo(
          checkout.validCheckout.firstName,
          checkout.validCheckout.lastName,
          checkout.validCheckout.postalCode
        );
        CheckoutPage.clickContinue();
        CheckoutPage.assertOnStepTwo();

        // Verify the math: subtotal + tax = total
        CheckoutPage.verifyOrderMath();
      });
    });

    it('should display correct number of items in order summary', () => {
      cy.fixture('checkout').then((checkout) => {
        InventoryPage.addItemToCartByIndex(0);
        InventoryPage.addItemToCartByIndex(1);
        InventoryPage.addItemToCartByIndex(2);
        InventoryPage.goToCart();
        CartPage.proceedToCheckout();

        CheckoutPage.fillCheckoutInfo(
          checkout.validCheckout.firstName,
          checkout.validCheckout.lastName,
          checkout.validCheckout.postalCode
        );
        CheckoutPage.clickContinue();
        CheckoutPage.assertOnStepTwo();

        cy.get(CheckoutPage.summaryItems).should('have.length', 3);
      });
    });
  });
});
