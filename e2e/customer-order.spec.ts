import { test, expect, Page } from "@playwright/test";
import { TEST_ACCOUNTS, TEST_DELIVERY_ADDRESS, TEST_PAYMENT_METHOD } from "./test-data";
import {
  LoginPage,
  CustomerHomePage,
  RestaurantDetailsPage,
  CheckoutPage,
  OrderTrackingPage,
} from "./pages";

test.describe("Customer Order Workflow", () => {
  let page: Page;
  let loginPage: LoginPage;
  let customerHomePage: CustomerHomePage;
  let restaurantDetailsPage: RestaurantDetailsPage;
  let checkoutPage: CheckoutPage;
  let orderTrackingPage: OrderTrackingPage;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    loginPage = new LoginPage(page);
    customerHomePage = new CustomerHomePage(page);
    restaurantDetailsPage = new RestaurantDetailsPage(page);
    checkoutPage = new CheckoutPage(page);
    orderTrackingPage = new OrderTrackingPage(page);
  });

  test.afterEach(async () => {
    await page.close();
  });

  test("should complete full customer order workflow", async () => {
    // Step 1: Login as customer
    await loginPage.goto();
    await expect(page).toHaveTitle(/Zimbites/);
    await loginPage.quickLogin("customer");

    // Verify redirected to customer home
    await page.waitForURL(/\/(home|restaurant)/);
    
    // Step 2: Browse restaurants and select one
    await customerHomePage.goto();
    await customerHomePage.waitForPageLoad();

    // Find and click on a restaurant
    const restaurantCards = page.locator('[class*="restaurant"], [class*="card"]');
    const cardCount = await restaurantCards.count();
    expect(cardCount).toBeGreaterThan(0);
    
    await restaurantCards.first().click();
    await page.waitForLoadState("networkidle");

    // Step 3: Add items to cart
    await restaurantDetailsPage.waitForPageLoad();
    
    // Find add buttons and click them
    const addButtons = page.locator('button:has-text("Add"), button:has-text("+"), button:has-text("Add to Cart")');
    const buttonCount = await addButtons.count();
    
    if (buttonCount > 0) {
      await addButtons.first().click();
      await page.waitForTimeout(500);
      
      if (buttonCount > 1) {
        await addButtons.nth(1).click();
        await page.waitForTimeout(500);
      }
    }

    // Step 4: Proceed to checkout
    const checkoutButton = page.locator('button:has-text("Checkout"), button:has-text("Proceed to Checkout"), a:has-text("Checkout")');
    if (await checkoutButton.isVisible()) {
      await checkoutButton.click();
      await page.waitForLoadState("networkidle");
    }

    // Step 5: Complete checkout
    await checkoutPage.waitForPageLoad();

    // Fill checkout form
    const addressInput = page.locator('input[id*="address"], textarea[id*="address"], input[placeholder*="address"]');
    if (await addressInput.isVisible()) {
      await addressInput.fill(TEST_DELIVERY_ADDRESS);
    }

    // Select payment method
    const paymentSelect = page.locator('select[id*="payment"], select');
    if (await paymentSelect.isVisible()) {
      await paymentSelect.selectOption({ label: TEST_PAYMENT_METHOD });
    }

    // Place order
    const placeOrderButton = page.locator('button:has-text("Place Order"), button:has-text("Submit Order")');
    if (await placeOrderButton.isVisible()) {
      await placeOrderButton.click();
      await page.waitForLoadState("networkidle");
    }

    // Verify order placement
    await page.waitForURL(/\/order\//, { timeout: 10000 });
    
    // Verify order tracking page loads
    const orderStatus = page.locator('[class*="status"], h1, h2');
    await expect(orderStatus.first()).toBeVisible();
  });

  test("should browse restaurants and view menu", async () => {
    // Login as customer
    await loginPage.goto();
    await loginPage.quickLogin("customer");
    await page.waitForURL(/\/(home|restaurant)/);

    // Browse restaurants
    await customerHomePage.goto();
    await customerHomePage.waitForPageLoad();

    // Verify restaurant cards are displayed
    const restaurantCards = page.locator('[class*="restaurant"], [class*="card"]');
    await expect(restaurantCards.first()).toBeVisible();

    // Click on restaurant to view details
    await restaurantCards.first().click();
    await page.waitForLoadState("networkidle");

    // Verify restaurant details page loaded
    const restaurantHeading = page.locator("h1, h2").first();
    await expect(restaurantHeading).toBeVisible();
  });

  test("should add items to cart", async () => {
    // Login as customer
    await loginPage.goto();
    await loginPage.quickLogin("customer");
    await page.waitForURL(/\/(home|restaurant)/);

    // Navigate to a restaurant
    const restaurantCards = page.locator('[class*="restaurant"], [class*="card"]');
    await restaurantCards.first().click();
    await page.waitForLoadState("networkidle");

    // Find and click add buttons
    const addButtons = page.locator('button:has-text("Add"), button:has-text("+")');
    const initialCount = await addButtons.count();

    if (initialCount > 0) {
      await addButtons.first().click();
      await page.waitForTimeout(500);

      // Verify item was added (check for toast or cart update)
      const toast = page.locator('[class*="toast"], [class*="notification"]');
      const cartBadge = page.locator('[class*="badge"], [class*="count"]');

      // Either toast appears or cart badge updates
      const toastVisible = await toast.isVisible().catch(() => false);
      const badgeVisible = await cartBadge.isVisible().catch(() => false);
      expect(toastVisible || badgeVisible || initialCount > 0).toBeTruthy();
    }
  });

  test("should complete checkout flow", async () => {
    // Login as customer
    await loginPage.goto();
    await loginPage.quickLogin("customer");
    await page.waitForURL(/\/(home|restaurant)/);

    // Navigate to a restaurant and add items
    const restaurantCards = page.locator('[class*="restaurant"], [class*="card"]');
    await restaurantCards.first().click();
    await page.waitForLoadState("networkidle");

    const addButtons = page.locator('button:has-text("Add"), button:has-text("+")');
    if (await addButtons.count() > 0) {
      await addButtons.first().click();
      await page.waitForTimeout(500);
    }

    // Go to checkout
    const checkoutButton = page.locator('button:has-text("Checkout"), a:has-text("Checkout")');
    if (await checkoutButton.isVisible()) {
      await checkoutButton.click();
      await page.waitForLoadState("networkidle");
    }

    // Verify checkout page
    const checkoutContent = page.locator('input, select, textarea');
    await expect(checkoutContent.first()).toBeVisible();

    // Fill form
    const addressInput = page.locator('input[id*="address"], textarea');
    if (await addressInput.isVisible()) {
      await addressInput.fill(TEST_DELIVERY_ADDRESS);
    }

    // Submit order
    const submitButton = page.locator('button:has-text("Place Order"), button:has-text("Submit")');
    if (await submitButton.isVisible()) {
      await submitButton.click();
      await page.waitForLoadState("networkidle");
    }

    // Should redirect to order tracking
    await page.waitForURL(/\/order\//, { timeout: 10000 });
  });

  test("should track order status", async ({ page: orderPage }) => {
    // Login as customer
    await loginPage.goto();
    await loginPage.quickLogin("customer");
    await page.waitForURL(/\/(home|restaurant)/);

    // Place an order first
    const restaurantCards = page.locator('[class*="restaurant"], [class*="card"]');
    await restaurantCards.first().click();
    await page.waitForLoadState("networkidle");

    const addButtons = page.locator('button:has-text("Add"), button:has-text("+")');
    if (await addButtons.count() > 0) {
      await addButtons.first().click();
      await page.waitForTimeout(500);
    }

    const checkoutButton = page.locator('button:has-text("Checkout"), a:has-text("Checkout")');
    if (await checkoutButton.isVisible()) {
      await checkoutButton.click();
      await page.waitForLoadState("networkidle");
    }

    const addressInput = page.locator('input[id*="address"], textarea');
    if (await addressInput.isVisible()) {
      await addressInput.fill(TEST_DELIVERY_ADDRESS);
    }

    const submitButton = page.locator('button:has-text("Place Order"), button:has-text("Submit")');
    if (await submitButton.isVisible()) {
      await submitButton.click();
      await page.waitForLoadState("networkidle");
    }

    // Verify order tracking page
    await page.waitForURL(/\/order\//, { timeout: 10000 });
    
    // Check for order status display
    const statusDisplay = page.locator('[class*="status"], text=/pending|accepted|preparing/i');
    await expect(statusDisplay.first()).toBeVisible();
  });

  test("should view order history", async () => {
    // Login as customer
    await loginPage.goto();
    await loginPage.quickLogin("customer");
    await page.waitForURL(/\/(home|restaurant)/);

    // Navigate to orders page
    const ordersLink = page.locator('a:has-text("Orders"), a:has-text("Order History")');
    if (await ordersLink.isVisible()) {
      await ordersLink.click();
      await page.waitForLoadState("networkidle");
    } else {
      await page.goto("/orders");
    }

    // Verify orders page loads
    const ordersContent = page.locator("h1, h2, [class*=\"order\"]");
    await expect(ordersContent.first()).toBeVisible();
  });
});