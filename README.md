# SauceDemo Test Automation Framework

![Cypress Tests](https://github.com/raihan38/SauceDemo/actions/workflows/ci.yml/badge.svg)

Test automation framework for [SauceDemo](https://www.saucedemo.com), built with Cypress.

## Why Cypress

- Built-in retry-ability — no manual wait logic, no `Thread.sleep`. Handles `performance_glitch_user` requirement out of the box
- Auto screenshots on failure — attaches to mochawesome report without extra plugins
- One install, everything included — test runner, assertion library, browser automation. No WebDriver binary management
- `cypress-io/github-action` makes CI setup trivial
- Time-travel debugging — snapshots every command, step through failures visually

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

**Page Object Model** — one class per page. Selectors are getter properties, actions are methods, assertions are methods. Test files never touch raw selectors. Selector changes = one file edit, not twenty.

**Custom Commands** — `cy.loginAsStandardUser()`, `cy.addToCart()`, `cy.assertCartCount()` live in `commands.js`. Login happens in nearly every test — defined once, used everywhere.

**Fixtures for all test data** — credentials in `users.json`, product info in `products.json`, checkout data in `checkout.json`. Zero hardcoded values in spec files.

**Config externalization** — `cypress.config.js` reads `BASE_URL` from env vars with defaults. Point at staging or production without code changes.

## Setup

```bash
git clone https://github.com/YOUR_USERNAME/SauceDemo.git
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

## Flakiness Handling

- `retries: { runMode: 1 }` — auto-retry once before marking failed
- `Cypress.on('uncaught:exception')` — suppresses SauceDemo's app-level React errors that aren't test-relevant
- `performance_glitch_user` tests rely on Cypress retry-ability, not hardcoded waits
- `pageLoadTimeout: 60000` — accommodates SauceDemo's inconsistent response times

## What I'd Add With More Time

- **API-layer setup** — `cy.request()` for login and test data seeding instead of UI clicks. Faster, less flaky
- **Visual regression** — Percy or Cypress snapshots for `problem_user` pixel-level comparison
- **Parallel execution** — `cypress-split` or Cypress Cloud to cut pipeline time
- **Docker** — consistent environments across local and CI
- **Accessibility** — `cypress-axe` for WCAG checks per page
- **Cross-browser** — Firefox and Edge in CI matrix
- **Test tagging** — `@smoke` / `@regression` / `@critical` to run subsets based on riskgit 