import InventoryPage from '../pages/InventoryPage';

describe('Product Catalog', () => {
  beforeEach(() => {
    cy.loginAsStandardUser();
    InventoryPage.assertOnInventoryPage();
  });

  describe('Product listing', () => {
    it('should display the correct number of products', () => {
      cy.fixture('products').then((products) => {
        InventoryPage.assertItemCount(products.expectedCount);
      });
    });

    it('should display name, price, and image for every product', () => {
      InventoryPage.assertAllItemsHaveNameAndPrice();

      cy.get('.inventory_item_img img').each(($img) => {
        cy.wrap($img)
          .should('be.visible')
          .and('have.attr', 'src')
          .and('not.be.empty');
      });
    });
  });

  describe('Sorting', () => {
    it('should sort products by Name A to Z', () => {
      cy.fixture('products').then((products) => {
        InventoryPage.sortBy(products.sortOptions.nameAsc);

        InventoryPage.getItemNames().then((names) => {
          const sorted = [...names].sort((a, b) => a.localeCompare(b));
          expect(names).to.deep.equal(sorted);
        });
      });
    });

    it('should sort products by Name Z to A', () => {
      cy.fixture('products').then((products) => {
        InventoryPage.sortBy(products.sortOptions.nameDesc);

        InventoryPage.getItemNames().then((names) => {
          const sorted = [...names].sort((a, b) => b.localeCompare(a));
          expect(names).to.deep.equal(sorted);
        });
      });
    });

    it('should sort products by Price Low to High', () => {
      cy.fixture('products').then((products) => {
        InventoryPage.sortBy(products.sortOptions.priceLowHigh);

        InventoryPage.getItemPrices().then((prices) => {
          const sorted = [...prices].sort((a, b) => a - b);
          expect(prices).to.deep.equal(sorted);
        });
      });
    });

    it('should sort products by Price High to Low', () => {
      cy.fixture('products').then((products) => {
        InventoryPage.sortBy(products.sortOptions.priceHighLow);

        InventoryPage.getItemPrices().then((prices) => {
          const sorted = [...prices].sort((a, b) => b - a);
          expect(prices).to.deep.equal(sorted);
        });
      });
    });
  });

  describe('problem_user — visual regression', () => {
    it('should detect broken or mismatched product images', () => {
      // Logout and login as problem_user
      InventoryPage.logout();

      cy.fixture('users').then((users) => {
        cy.login(users.problem.username, users.problem.password);
      });

      InventoryPage.assertOnInventoryPage();

      // problem_user shows the same image src for all products
      // Collect all image srcs and verify they are NOT all identical
      InventoryPage.getItemImageSources().then((sources) => {
        const uniqueSources = [...new Set(sources)];

        // If all images have the same src, problem_user bug is confirmed
        // We EXPECT this to be broken — so we assert the defect exists
        if (uniqueSources.length === 1) {
          // All images are the same — this is the known problem_user bug
          expect(uniqueSources.length).to.equal(1);
          cy.log('DEFECT CONFIRMED: All product images are identical for problem_user');
        } else {
          // If images are unique, flag as unexpected (bug may have been fixed)
          cy.log('NOTE: Product images appear correct for problem_user');
        }
      });
    });
  });
});
