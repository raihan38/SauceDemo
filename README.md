# SauceDemo Test Automation Framework

[![Cypress Tests](https://github.com/raihan38/SauceDemo/actions/workflows/ci.yml/badge.svg)](https://github.com/raihan38/SauceDemo/actions)  
Test automation framework for [SauceDemo](https://www.saucedemo.com), built with Cypress.

## Why Cypress

- Built-in retry-ability : no manual wait logic, no `Thread.sleep`. Handles `performance_glitch_user` requirement out of the box
- Auto screenshots on failure : attaches to mochawesome report without extra plugins
- One install, everything included : test runner, assertion library, browser automation. No WebDriver binary management
- `cypress-io/github-action` makes CI setup trivial
- Time-travel debugging : snapshots every command, step through failures visually

**Trade-offs:** No Safari/IE support. Can't do multi-tab or multi-domain natively. Playwright would be the pick if cross-browser was a hard requirement.

## Project Structure

```
├── cypress/
│   ├── e2e/                              # Test suites
│   │   ├── auth.cy.js                    # 10 tests
│   │   ├── product_catalog.cy.js         # 7 tests
│   │   ├── shopping_cart.cy.js           # 7 tests
│   │   ├── checkout.cy.js               # 7 tests
│   │   └── performance_resilience.cy.js  # 6 tests
│   ├── pages/                            # Page Object Model
│   │   ├── LoginPage.js
│   │   ├── InventoryPage.js
│   │   ├── CartPage.js
│   │   ├── CheckoutPage.js
│   │   └── CheckoutCompletePage.js
│   ├── fixtures/                         # Test data (JSON)
│   │   ├── users.json
│   │   ├── products.json
│   │   └── checkout.json
│   └── support/
│       ├── commands.js                   # Custom commands
│       └── e2e.js                        # Global hooks
├── .github/workflows/ci.yml             # GitHub Actions
├── cypress.config.js                     # Config (env-aware)
├── package.json
└── README.md
```

## Design Decisions

**Page Object Model** : one class per page. Selectors are getter properties, actions are methods, assertions are methods. Test files never touch raw selectors. Selector changes = one file edit, not twenty.

**Custom Commands** : `cy.loginAsStandardUser()`, `cy.addToCart()`, `cy.assertCartCount()` live in `commands.js`. Login happens in nearly every test defined once, used everywhere.

**Fixtures for all test data** : credentials in `users.json`, product info in `products.json`, checkout data in `checkout.json`. Zero hardcoded values in spec files.

**Config externalization** : `cypress.config.js` reads `BASE_URL` from env vars with defaults. Point at staging or production without code changes.

## Setup

```bash
git clone https://github.com/raihan38/SauceDemo.git
cd SauceDemo
npm install
```

## Run

```bash
npm test                  # all tests, headless
npm run test:headed       # all tests, browser visible
npm run test:open         # Cypress interactive runner
npm run test:auth         # auth suite only
npm run test:catalog      # product catalog only
npm run test:cart         # shopping cart only
npm run test:checkout     # checkout only
npm run test:resilience   # performance + error_user only
```

## Reports

```bash
npm run report
```

Opens `cypress/reports/html/report.html`. Failed tests include embedded screenshots.

## CI/CD

GitHub Actions workflow triggers on push and PR to `main`.

**What it does:** install deps → run tests → merge mochawesome JSONs into one HTML report → upload report as artifact. Screenshots upload separately on failure.

**Check results:** Repo → Actions tab → latest run → download `cypress-test-report` artifact.

## Test Coverage

| Suite | Tests | What's covered |
|-------|-------|----------------|
| Auth | 10 | Valid login, wrong password, empty fields, SQL injection, lockout, logout, session protection after logout |
| Product Catalog | 7 | Item count, names/prices/images visible, all 4 sort options verified against actual data order, `problem_user` broken image detection |
| Shopping Cart | 7 | Add single/multiple items, remove items, badge updates, cart persistence across navigation, price consistency between inventory and cart |
| Checkout | 7 | Full E2E purchase, missing field validation (3 fields separately), order math verification (subtotal + tax = total), item count in summary |
| Performance & Resilience | 6 | `performance_glitch_user` login + inventory load with smart waits (zero `cy.wait()`), `error_user` failures on add/remove/checkout/sort |
| **Total** | **37** | |


### Authentication Tests (`auth.cy.js`)

| ID | Test Case | Type |
|----|-----------|------|
| TC-AUTH-001 | Login with valid standard_user credentials | Positive |
| TC-AUTH-002 | Show error for incorrect password | Negative |
| TC-AUTH-003 | Show error for non-existent username | Negative |
| TC-AUTH-004 | Show error when username is empty | Negative |
| TC-AUTH-005 | Show error when password is empty | Negative |
| TC-AUTH-006 | Show error when both fields are empty | Negative |
| TC-AUTH-007 | Handle SQL injection attempt in username field | Security |
| TC-AUTH-008 | Show locked out error message | Negative |
| TC-AUTH-009 | Logout successfully and redirect to login page | Positive |
| TC-AUTH-010 | Cannot access inventory page after logout | Security |

### Product Catalog Tests (`product_catalog.cy.js`)

| ID | Test Case | Type |
|----|-----------|------|
| TC-CAT-001 | Display correct number of products (6) | Positive |
| TC-CAT-002 | Display name, price, and image for every product | Positive |
| TC-CAT-003 | Sort products by Name A to Z | Functional |
| TC-CAT-004 | Sort products by Name Z to A | Functional |
| TC-CAT-005 | Sort products by Price Low to High | Functional |
| TC-CAT-006 | Sort products by Price High to Low | Functional |
| TC-CAT-007 | Detect broken/mismatched images for problem_user | Defect Detection |

### Shopping Cart Tests (`shopping_cart.cy.js`)

| ID | Test Case | Type |
|----|-----------|------|
| TC-CART-001 | Add single item, cart badge shows 1 | Positive |
| TC-CART-002 | Add multiple items, cart badge shows 3 | Positive |
| TC-CART-003 | All added items appear in cart page | Positive |
| TC-CART-004 | Remove item from cart, badge decrements | Positive |
| TC-CART-005 | Remove all items, cart badge disappears | Edge Case |
| TC-CART-006 | Cart persists across page navigation | Positive |
| TC-CART-007 | Prices match between inventory and cart | Edge Case |

### Checkout Tests (`checkout.cy.js`)

| ID | Test Case | Type |
|----|-----------|------|
| TC-CHK-001 | Complete full purchase, confirmation shown | E2E |
| TC-CHK-002 | Back Home returns to inventory after purchase | Positive |
| TC-CHK-003 | Error when first name is missing | Negative |
| TC-CHK-004 | Error when last name is missing | Negative |
| TC-CHK-005 | Error when postal code is missing | Negative |
| TC-CHK-006 | Item subtotal + tax = total (math verification) | Edge Case |
| TC-CHK-007 | Correct number of items in order summary | Edge Case |

### Performance & Resilience Tests (`performance_resilience.cy.js`)

| ID | Test Case | Type |
|----|-----------|------|
| TC-PERF-001 | performance_glitch_user login succeeds despite delay | Resilience |
| TC-PERF-002 | Inventory loads fully despite performance glitch | Resilience |
| TC-ERR-001 | error_user: add to cart fails | Defect Detection |
| TC-ERR-002 | error_user: checkout process fails | Defect Detection |
| TC-ERR-003 | error_user: sorting fails | Defect Detection |
| TC-ERR-004 | error_user: remove from cart fails | Defect Detection |

**Total: 37 tests**

## Flakiness Handling

- `retries: { runMode: 1 }` : auto-retry once before marking failed
- `Cypress.on('uncaught:exception')` : suppresses SauceDemo's app-level React errors that aren't test-relevant
- `performance_glitch_user` tests rely on Cypress retry-ability, not hardcoded waits
- `pageLoadTimeout: 60000` : accommodates SauceDemo's inconsistent response times

## What I'd Add With More Time

- **API-layer setup** : `cy.request()` for login and test data seeding instead of UI clicks. Faster, less flaky
- **Visual regression** : Percy or Cypress snapshots for `problem_user` pixel-level comparison
- **Parallel execution** : `cypress-split` or Cypress Cloud to cut pipeline time
- **Docker** : consistent environments across local and CI
- **Accessibility** : `cypress-axe` for WCAG checks per page
- **Cross-browser** : Firefox and Edge in CI matrix
- **Test tagging** : `@smoke` / `@regression` / `@critical` to run subsets based on riskgit 