# E2E Testing Guide for ZimBites

This directory contains Playwright-based end-to-end tests for the ZimBites food delivery platform.

## Overview

The E2E tests cover the complete order lifecycle workflow across all user roles:

- **Customer**: Browse restaurants, add items to cart, checkout, track orders
- **Restaurant Owner**: View pending orders, accept/reject orders, mark as preparing, mark as ready
- **Driver**: View available deliveries, accept deliveries, pick up, deliver
- **Admin**: View platform stats, manage users, restaurants, and orders

## Test Structure

```
e2e/
├── README.md                 # This file
├── test-data.ts              # Test data and constants
├── setup.ts                  # Global setup/teardown
├── playwright.config.ts      # Playwright configuration
├── pages/
│   ├── index.ts              # Page object exports
│   ├── base-page.ts          # Base page object class
│   ├── login-page.ts         # Login page object
│   ├── customer-home-page.ts # Customer home page object
│   ├── restaurant-details-page.ts
│   ├── checkout-page.ts
│   ├── order-tracking-page.ts
│   ├── restaurant-dashboard-page.ts
│   ├── driver-dashboard-page.ts
│   └── admin-dashboard-page.ts
├── auth.spec.ts              # Authentication tests
├── customer-order.spec.ts    # Customer workflow tests
├── restaurant-workflow.spec.ts
├── driver-workflow.spec.ts
├── admin-workflow.spec.ts
└── full-workflow.spec.ts     # Complete end-to-end workflow tests
```

## Running Tests

### Prerequisites

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Install Playwright browsers:
   ```bash
   npx playwright install chromium
   ```

### Run All Tests

```bash
# From project root
pnpm test:e2e

# Or use npx directly
npx playwright test
```

### Run Specific Test Suites

```bash
# Authentication tests only
npx playwright test e2e/auth.spec.ts

# Customer workflow tests
npx playwright test e2e/customer-order.spec.ts

# Restaurant workflow tests
npx playwright test e2e/restaurant-workflow.spec.ts

# Driver workflow tests
npx playwright test e2e/driver-workflow.spec.ts

# Admin workflow tests
npx playwright test e2e/admin-workflow.spec.ts

# Full workflow (complete order lifecycle)
npx playwright test e2e/full-workflow.spec.ts
```

### Run with UI Mode (Interactive)

```bash
pnpm test:e2e:ui
```

### Run in Headed Mode (See Browser)

```bash
pnpm test:e2e:headed
```

### Debug Mode

```bash
pnpm test:e2e:debug
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `BASE_URL` | `http://localhost:3000` | Base URL for tests |
| `CI` | `false` | Run in CI mode (reduced parallelism, more retries) |

### Playwright Configuration

The configuration is in `playwright.config.ts`:
- Tests run against Chromium by default
- Screenshots are taken on failure
- Videos are recorded on failure
- Traces are captured for debugging

## Test Accounts

The tests use demo accounts defined in `test-data.ts`:

| Role | OpenID | Email |
|------|--------|-------|
| Customer | `customer-demo-001` | john@example.com |
| Restaurant | `restaurant-demo-001` | marcus@zimbites.com |
| Driver | `driver-demo-001` | david.driver@zimbites.com |
| Admin | `admin-demo-001` | admin@zimbites.com |

## Test Coverage

### Authentication Tests (`auth.spec.ts`)
- ✅ Login page renders correctly
- ✅ Demo account buttons are visible
- ✅ Login with all user roles
- ✅ Custom OpenID login
- ✅ Invalid OpenID handling
- ✅ Logout functionality
- ✅ Session persistence
- ✅ Protected route redirection

### Customer Order Tests (`customer-order.spec.ts`)
- ✅ Complete order workflow
- ✅ Browse restaurants and view menus
- ✅ Add items to cart
- ✅ Complete checkout flow
- ✅ Track order status
- ✅ View order history

### Restaurant Workflow Tests (`restaurant-workflow.spec.ts`)
- ✅ Login and view dashboard
- ✅ View pending orders
- ✅ Accept orders
- ✅ Reject orders
- ✅ Start preparing orders
- ✅ Mark orders as ready for pickup
- ✅ Complete order lifecycle
- ✅ View order details

### Driver Workflow Tests (`driver-workflow.spec.ts`)
- ✅ Login and view dashboard
- ✅ View available deliveries
- ✅ Accept deliveries
- ✅ Confirm pickup
- ✅ Mark as out for delivery
- ✅ Confirm delivery
- ✅ Complete delivery lifecycle
- ✅ Toggle online/offline status
- ✅ View earnings

### Admin Workflow Tests (`admin-workflow.spec.ts`)
- ✅ Login and view dashboard
- ✅ View platform statistics
- ✅ View all users
- ✅ View all restaurants
- ✅ View all orders
- ✅ Approve restaurants
- ✅ Approve drivers
- ✅ Manage user roles
- ✅ Monitor orders

### Full Workflow Tests (`full-workflow.spec.ts`)
- ✅ Complete order lifecycle (customer → restaurant → driver → delivered)
- ✅ Real-time order status updates
- ✅ Restaurant receives new order notification
- ✅ Driver receives available delivery notification

## Writing New Tests

### Using Page Objects

```typescript
import { test, expect } from "@playwright/test";
import { LoginPage, CustomerHomePage } from "./pages";

test("my test", async ({ page }) => {
  const loginPage = new LoginPage(page);
  const customerHomePage = new CustomerHomePage(page);

  // Login
  await loginPage.goto();
  await loginPage.quickLogin("customer");
  
  // Navigate
  await customerHomePage.goto();
  await customerHomePage.waitForPageLoad();
  
  // Assert
  await expect(page.locator("h1")).toHaveText("Expected Title");
});
```

### Best Practices

1. **Use page objects** for reusable interactions
2. **Add `data-testid`** attributes to components for easier selection
3. **Handle async operations** with proper waits
4. **Use role-based selectors** (e.g., `button:has-text("Submit")`) over fragile CSS selectors
5. **Take screenshots on failure** for debugging
6. **Clean up after tests** (close pages, contexts)

## Troubleshooting

### Tests fail with "Cannot find element"
- Check if the element selector is correct
- Add appropriate waits for dynamic content
- Use `page.waitForLoadState("networkidle")` before querying

### Tests timeout
- Increase timeout in `playwright.config.ts`
- Check if the development server is running
- Verify database is seeded with test data

### Authentication issues
- Verify demo accounts exist in database
- Check if dev login endpoint is working
- Clear browser context/storage

## CI/CD Integration

For GitHub Actions, add this to your workflow:

```yaml
- name: Run E2E Tests
  run: pnpm test:e2e
  env:
    CI: true
    BASE_URL: ${{ vars.DEPLOYMENT_URL }}
```

## Reports

Test reports are generated in:
- `playwright-report/` - HTML report
- `test-results/` - Detailed test results with screenshots and videos

## Notes

- Tests are designed to be idempotent - they can run multiple times
- Each test uses fresh browser context for isolation
- Failed tests will have screenshots and traces for debugging
- Tests automatically start the dev server if not running (configurable)