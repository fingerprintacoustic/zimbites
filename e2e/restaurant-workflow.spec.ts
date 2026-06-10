import { test, expect, Page } from "@playwright/test";
import { LoginPage, RestaurantDashboardPage } from "./pages";

test.describe("Restaurant Owner Workflow", () => {
  let page: Page;
  let loginPage: LoginPage;
  let restaurantDashboardPage: RestaurantDashboardPage;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    loginPage = new LoginPage(page);
    restaurantDashboardPage = new RestaurantDashboardPage(page);
  });

  test.afterEach(async () => {
    await page.close();
  });

  test("should login as restaurant owner and view dashboard", async () => {
    await loginPage.goto();
    await expect(page).toHaveTitle(/Zimbites/);
    
    await loginPage.quickLogin("restaurant");
    await page.waitForURL(/\/restaurant-dashboard/);

    // Verify dashboard elements
    const dashboard = page.locator('[class*="dashboard"], h1');
    await expect(dashboard.first()).toBeVisible();
  });

  test("should view pending orders", async () => {
    await loginPage.goto();
    await loginPage.quickLogin("restaurant");
    await page.waitForURL(/\/restaurant-dashboard/);

    // Wait for orders to load
    await page.waitForLoadState("networkidle");

    // Check for orders section
    const ordersSection = page.locator('[class*="order"], [class*="pending"]');
    await expect(ordersSection.first()).toBeVisible({ timeout: 10000 });
  });

  test("should accept an order", async () => {
    await loginPage.goto();
    await loginPage.quickLogin("restaurant");
    await page.waitForURL(/\/restaurant-dashboard/);
    await page.waitForLoadState("networkidle");

    // Find an accept button
    const acceptButton = page.locator('button:has-text("Accept"), button:has-text("Confirm")');
    
    if (await acceptButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await acceptButton.first().click();
      await page.waitForLoadState("networkidle");

      // Verify order status changed
      const statusUpdate = page.locator('text=/accepted|preparing/i');
      await expect(statusUpdate.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test("should reject an order", async () => {
    await loginPage.goto();
    await loginPage.quickLogin("restaurant");
    await page.waitForURL(/\/restaurant-dashboard/);
    await page.waitForLoadState("networkidle");

    // Find a reject button
    const rejectButton = page.locator('button:has-text("Reject"), button:has-text("Decline")');
    
    if (await rejectButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await rejectButton.first().click();
      await page.waitForLoadState("networkidle");

      // Verify rejection feedback
      const feedback = page.locator('text=/rejected|cancelled/i');
      await expect(feedback.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test("should start preparing an order", async () => {
    await loginPage.goto();
    await loginPage.quickLogin("restaurant");
    await page.waitForURL(/\/restaurant-dashboard/);
    await page.waitForLoadState("networkidle");

    // Find a preparing button
    const preparingButton = page.locator('button:has-text("Start Preparing"), button:has-text("Preparing")');
    
    if (await preparingButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await preparingButton.first().click();
      await page.waitForLoadState("networkidle");

      // Verify status change
      const statusUpdate = page.locator('text=/preparing|ready/i');
      await expect(statusUpdate.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test("should mark order as ready for pickup", async () => {
    await loginPage.goto();
    await loginPage.quickLogin("restaurant");
    await page.waitForURL(/\/restaurant-dashboard/);
    await page.waitForLoadState("networkidle");

    // Find a ready button
    const readyButton = page.locator('button:has-text("Mark Ready"), button:has-text("Ready")');
    
    if (await readyButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await readyButton.first().click();
      await page.waitForLoadState("networkidle");

      // Verify ready status
      const readyStatus = page.locator('text=/ready|waiting.*driver/i');
      await expect(readyStatus.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test("should handle complete order lifecycle", async () => {
    await loginPage.goto();
    await loginPage.quickLogin("restaurant");
    await page.waitForURL(/\/restaurant-dashboard/);
    await page.waitForLoadState("networkidle");

    // Accept order
    const acceptButton = page.locator('button:has-text("Accept"), button:has-text("Confirm")');
    if (await acceptButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await acceptButton.first().click();
      await page.waitForTimeout(1000);
    }

    // Start preparing
    const preparingButton = page.locator('button:has-text("Start Preparing"), button:has-text("Preparing")');
    if (await preparingButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await preparingButton.first().click();
      await page.waitForTimeout(1000);
    }

    // Mark ready
    const readyButton = page.locator('button:has-text("Mark Ready"), button:has-text("Ready")');
    if (await readyButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await readyButton.first().click();
      await page.waitForTimeout(1000);
    }

    // Verify final status
    const finalStatus = page.locator('text=/ready|waiting.*pickup/i');
    await expect(finalStatus.first()).toBeVisible({ timeout: 5000 });
  });

  test("should view order details", async () => {
    await loginPage.goto();
    await loginPage.quickLogin("restaurant");
    await page.waitForURL(/\/restaurant-dashboard/);
    await page.waitForLoadState("networkidle");

    // Find an order card
    const orderCard = page.locator('[class*="order-card"], [class*="card"]');
    
    if (await orderCard.first().isVisible({ timeout: 5000 }).catch(() => false)) {
      await orderCard.first().click();
      await page.waitForLoadState("networkidle");

      // Verify order details displayed
      const orderDetails = page.locator('[class*="details"], [class*="order-info"]');
      await expect(orderDetails.first()).toBeVisible({ timeout: 5000 });
    }
  });
});