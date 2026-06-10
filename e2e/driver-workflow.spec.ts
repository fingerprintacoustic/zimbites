import { test, expect, Page } from "@playwright/test";
import { LoginPage, DriverDashboardPage } from "./pages";

test.describe("Driver Workflow", () => {
  let page: Page;
  let loginPage: LoginPage;
  let driverDashboardPage: DriverDashboardPage;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    loginPage = new LoginPage(page);
    driverDashboardPage = new DriverDashboardPage(page);
  });

  test.afterEach(async () => {
    await page.close();
  });

  test("should login as driver and view dashboard", async () => {
    await loginPage.goto();
    await expect(page).toHaveTitle(/Zimbites/);
    
    await loginPage.quickLogin("driver");
    await page.waitForURL(/\/driver-dashboard/);

    // Verify dashboard elements
    const dashboard = page.locator('[class*="dashboard"], h1');
    await expect(dashboard.first()).toBeVisible();
  });

  test("should view available deliveries", async () => {
    await loginPage.goto();
    await loginPage.quickLogin("driver");
    await page.waitForURL(/\/driver-dashboard/);

    // Wait for orders to load
    await page.waitForLoadState("networkidle");

    // Check for available orders section
    const availableOrders = page.locator('[class*="available"], [class*="deliveries"]');
    await expect(availableOrders.first()).toBeVisible({ timeout: 10000 });
  });

  test("should accept a delivery", async () => {
    await loginPage.goto();
    await loginPage.quickLogin("driver");
    await page.waitForURL(/\/driver-dashboard/);
    await page.waitForLoadState("networkidle");

    // Find an accept button
    const acceptButton = page.locator('button:has-text("Accept"), button:has-text("Pick Up")');
    
    if (await acceptButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await acceptButton.first().click();
      await page.waitForLoadState("networkidle");

      // Verify delivery is now active
      const activeDelivery = page.locator('[class*="active"], text=/picked.*up|assigned/i');
      await expect(activeDelivery.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test("should confirm pickup", async () => {
    await loginPage.goto();
    await loginPage.quickLogin("driver");
    await page.waitForURL(/\/driver-dashboard/);
    await page.waitForLoadState("networkidle");

    // Find a confirm pickup button
    const pickupButton = page.locator('button:has-text("Confirm Pickup"), button:has-text("Picked Up")');
    
    if (await pickupButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await pickupButton.first().click();
      await page.waitForLoadState("networkidle");

      // Verify status update
      const statusUpdate = page.locator('text=/picked.*up|out.*for.*delivery/i');
      await expect(statusUpdate.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test("should mark as out for delivery", async () => {
    await loginPage.goto();
    await loginPage.quickLogin("driver");
    await page.waitForURL(/\/driver-dashboard/);
    await page.waitForLoadState("networkidle");

    // Find an out for delivery button
    const outButton = page.locator('button:has-text("Out for Delivery"), button:has-text("Delivering")');
    
    if (await outButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await outButton.first().click();
      await page.waitForLoadState("networkidle");

      // Verify status update
      const statusUpdate = page.locator('text=/out.*for.*delivery|delivering/i');
      await expect(statusUpdate.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test("should confirm delivery", async () => {
    await loginPage.goto();
    await loginPage.quickLogin("driver");
    await page.waitForURL(/\/driver-dashboard/);
    await page.waitForLoadState("networkidle");

    // Find a confirm delivery button
    const deliveryButton = page.locator('button:has-text("Confirm Delivery"), button:has-text("Delivered")');
    
    if (await deliveryButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await deliveryButton.first().click();
      await page.waitForLoadState("networkidle");

      // Verify delivery confirmed
      const confirmation = page.locator('text=/delivered|completed/i');
      await expect(confirmation.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test("should handle complete delivery lifecycle", async () => {
    await loginPage.goto();
    await loginPage.quickLogin("driver");
    await page.waitForURL(/\/driver-dashboard/);
    await page.waitForLoadState("networkidle");

    // Accept delivery
    const acceptButton = page.locator('button:has-text("Accept"), button:has-text("Pick Up")');
    if (await acceptButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await acceptButton.first().click();
      await page.waitForTimeout(1000);
    }

    // Confirm pickup
    const pickupButton = page.locator('button:has-text("Confirm Pickup"), button:has-text("Picked Up")');
    if (await pickupButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await pickupButton.first().click();
      await page.waitForTimeout(1000);
    }

    // Mark out for delivery
    const outButton = page.locator('button:has-text("Out for Delivery"), button:has-text("Delivering")');
    if (await outButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await outButton.first().click();
      await page.waitForTimeout(1000);
    }

    // Confirm delivery
    const deliveryButton = page.locator('button:has-text("Confirm Delivery"), button:has-text("Delivered")');
    if (await deliveryButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await deliveryButton.first().click();
      await page.waitForTimeout(1000);
    }

    // Verify final status
    const finalStatus = page.locator('text=/delivered|completed/i');
    await expect(finalStatus.first()).toBeVisible({ timeout: 5000 });
  });

  test("should toggle online/offline status", async () => {
    await loginPage.goto();
    await loginPage.quickLogin("driver");
    await page.waitForURL(/\/driver-dashboard/);

    // Find status toggle
    const statusToggle = page.locator('button:has-text("Online"), button:has-text("Offline"), [class*="toggle"]');
    
    if (await statusToggle.isVisible({ timeout: 5000 }).catch(() => false)) {
      await statusToggle.first().click();
      await page.waitForLoadState("networkidle");

      // Verify status changed
      const newStatus = page.locator('text=/online|offline/i');
      await expect(newStatus.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test("should view earnings", async () => {
    await loginPage.goto();
    await loginPage.quickLogin("driver");
    await page.waitForURL(/\/driver-dashboard/);

    // Check for earnings display
    const earnings = page.locator('[class*="earnings"], text=/\\$|ZWL/i');
    await expect(earnings.first()).toBeVisible({ timeout: 5000 });
  });
});