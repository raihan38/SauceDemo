import LoginPage from '../pages/LoginPage';
import InventoryPage from '../pages/InventoryPage';

describe('Authentication', () => {
  beforeEach(() => {
    LoginPage.visit();
  });

  context('Successful login', () => {
    it('TC-Auth-01 should login with valid standard user credentials', () => {
      cy.fixture('users').then((users) => {
        LoginPage.login(users.standard.username, users.standard.password);
        InventoryPage.assertOnInventoryPage();
      });
    });
  });

  describe('Login failure invalid credentials', () => {
    it('TC-Auth-02 should show error for incorrect password', () => {
      cy.fixture('users').then((users) => {
        LoginPage.login(users.standard.username, 'wrong_password');
        LoginPage.assertErrorVisible(
          'Epic sadface: Username and password do not match any user in this service'
        );
      });
    });

    it('TC-Auth-03 should show error for non-existent username', () => {
      cy.fixture('users').then((users) => {
        LoginPage.login(users.invalid.username, users.invalid.password);
        LoginPage.assertErrorVisible(
          'Epic sadface: Username and password do not match any user in this service'
        );
      });
    });

    it('TC-Auth-04 should show error when username is empty', () => {
      LoginPage.submitWithPasswordOnly('secret_sauce');
      LoginPage.assertErrorVisible('Epic sadface: Username is required');
    });

    it('TC-Auth-05 should show error when password is empty', () => {
      cy.fixture('users').then((users) => {
        LoginPage.submitWithUsernameOnly(users.standard.username);
        LoginPage.assertErrorVisible('Epic sadface: Password is required');
      });
    });

    it('TC-Auth-06 should show error when both fields are empty', () => {
      LoginPage.submitEmpty();
      LoginPage.assertErrorVisible('Epic sadface: Username is required');
    });

    it('TC-Auth-07 should handle SQL injection attempt in username field', () => {
      LoginPage.login("' OR '1'='1", 'secret_sauce');
      LoginPage.assertErrorVisible(
        'Epic sadface: Username and password do not match any user in this service'
      );
    });
  });

  describe('Locked out user', () => {
    it('TC-Auth-08 should show locked out error message', () => {
      cy.fixture('users').then((users) => {
        LoginPage.login(users.lockedOut.username, users.lockedOut.password);
        LoginPage.assertErrorVisible(
          'Epic sadface: Sorry, this user has been locked out.'
        );
      });
    });
  });

  describe('Session persistence and logout', () => {
    it('TC-Auth-09 should logout successfully and redirect to login page', () => {
      cy.fixture('users').then((users) => {
        LoginPage.login(users.standard.username, users.standard.password);
        InventoryPage.assertOnInventoryPage();
        InventoryPage.logout();
        LoginPage.assertOnLoginPage();
      });
    });

    it('TC-Auth-10 should not allow access to inventory page after logout', () => {
      cy.fixture('users').then((users) => {
        LoginPage.login(users.standard.username, users.standard.password);
        InventoryPage.assertOnInventoryPage();
        InventoryPage.logout();
        LoginPage.assertOnLoginPage();

        // Attempt to navigate directly to inventory
        cy.visit('/inventory.html',{ failOnStatusCode: false });
        LoginPage.assertErrorVisible(
          "Epic sadface: You can only access '/inventory.html' when you are logged in."
        );
      });
    });
  });
});
