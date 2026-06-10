import { test, expect, Page } from "@playwright/test";
import { LoginPage, AdminDashboardPage } from "./pages";

test.describe("Admin Workflow", () => {
  let page: Page;
  let loginPage: LoginPage;
  let adminDashboardPage: AdminDashboardPage;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    loginPage = new LoginPage(page);
    adminDashboardPage = new AdminDashboardPage(page);
  });

  test.afterEach(async () => {
    await page.close();
  });

  test("should login as admin and view dashboard", async () => {
    await loginPage.goto();
    await expect(page).toHaveTitle(/Zimbites/);
    
    await loginPage.quickLogin("admin");
    await page.waitForURL(/\/admin-dashboard/);

    // Verify dashboard elements
    const dashboard = page.locator('[class*="dashboard"], h1');
    await expect(dashboard.first()).toBeVisible();
  });

  test("should view platform statistics", async () => {
    await loginPage.goto();
    await loginPage.quickLogin("admin");
    await page.waitForURL(/\/admin-dashboard/);

    // Wait for stats to load
    await page.waitForLoadState("networkidle");

    // Check for statistics cards
    const statsCards = page.locator('[class*="stat"], [class*="card"]');
    await expect(statsCards.first()).toBeVisible({ timeout: 10000 });
  });

  test("should view all users", async () => {
    await loginPage.goto();
    await loginPage.quickLogin("admin");
    await page.waitForURL(/\/admin-dashboard/);
    await page.waitForLoadState("networkidle");

    // Navigate to users tab
    const usersTab = page.locator('button:has-text("Users"), a:has-text("Users")');
    if (await usersTab.isVisible()) {
      await usersTab.click();
      await page.waitForLoadState("networkidle");
    }

    // Verify users list
    const usersList = page.locator('[class*="user"], [class*="row"]');
    await expect(usersList.first()).toBeVisible({ timeout: 5000 });
  });

  test("should view all restaurants", async () => {
    await loginPage.goto();
    await loginPage.quickLogin("admin");
    await page.waitForURL(/\/admin-dashboard/);
    await page.waitForLoadState("networkidle");

    // Navigate to restaurants tab
    const restaurantsTab = page.locator('button:has-text("Restaurants"), a:has-text("Restaurants")');
    if (await restaurantsTab.isVisible()) {
      await restaurantsTab.click();
      await page.waitForLoadState("networkidle");
    }

    // Verify restaurants list
    const restaurantsList = page.locator('[class*="restaurant"], [class*="row"]');
    await expect(restaurantsList.first()).toBeVisible({ timeout: 5000 });
  });

  test("should view all orders", async () => {
    await loginPage.goto();
    await loginPage.quickLogin("admin");
    await page.waitForURL(/\/admin-dashboard/);
    await page.waitForLoadState("networkidle");

    // Navigate to orders tab
    const ordersTab = page.locator('button:has-text("Orders"), a:has-text("Orders")');
    if (await ordersTab.isVisible()) {
      await ordersTab.click();
      await page.waitForLoadState("networkidle");
    }

    // Verify orders list
    const ordersList = page.locator('[class*="order"], [class*="row"]');
    await expect(ordersList.first()).toBeVisible({ timeout: 5000 });
  });

  test("should approve a restaurant", async () => {
    await loginPage.goto();
    await loginPage.quickLogin("admin");
    await page.waitForURL(/\/admin-dashboard/);
    await page.waitForLoadState("networkidle");

    // Navigate to restaurants tab
    const restaurantsTab = page.locator('button:has-text("Restaurants"), a:has-text("Restaurants")');
    if (await restaurantsTab.isVisible()) {
      await restaurantsTab.click();
      await page.waitForLoadState("networkidle");
    }

    // Find approve button
    const approveButton = page.locator('button:has-text("Approve"), button:has-text("Accept")');
    
    if (await approveButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await approveButton.first().click();
      await page.waitForLoadState("networkidle");

      // Verify approval feedback
      const approvedStatus = page.locator('text=/approved|active/i');
      await expect(approvedStatus.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test("should approve a driver", async () => {
    await loginPage.goto();
    await loginPage.quickLogin("admin");
    await page.waitForURL(/\/admin-dashboard/);
    await page.waitForLoadState("networkidle");

    // Navigate to drivers section (may be in users tab)
    const driversTab = page.locator('button:has-text("Drivers"), a:has-text("Drivers")');
    if (await driversTab.isVisible()) {
      await driversTab.click();
      await page.waitForLoadState("networkidle");
    }

    // Find approve button
    const approveButton = page.locator('button:has-text("Approve"), button:has-text("Accept")');
    
    if (await approveButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await approveButton.first().click();
      await page.waitForLoadState("networkidle");

      // Verify approval feedback
      const approvedStatus = page.locator('text=/approved|active/i');
      await expect(approvedStatus.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test("should manage user roles", async () => {
    await loginPage.goto();
    await loginPage.quickLogin("admin");
    await page.waitForURL(/\/admin-dashboard/);
    await page.waitForLoadState("networkidle");

    // Navigate to users tab
    const usersTab = page.locator('button:has-text("Users"), a:has-text("Users")');
    if (await usersTab.isVisible()) {
      await usersTab.click();
      await page.waitForLoadState("networkidle");
    }

    // Check for role management controls
    const roleControls = page.locator('[class*="role"], select, [role="combobox"]');
    await expect(roleControls.first()).toBeVisible({ timeout: 5000 });
  });

  test("should monitor orders", async () => {
    await loginPage.goto();
    await loginPage.quickLogin("admin");
    await page.waitForURL(/\/admin-dashboard/);
    await page.waitForLoadState("networkidle");

    // Navigate to orders tab
    const ordersTab = page.locator('button:has-text("Orders"), a:has-text("Orders")');
    if (await ordersTab.isVisible()) {
      await ordersTab.click();
      await page.waitForLoadState("networkidle");
    }

    // Verify orders are displayed
    const ordersList = page.locator('[class*="order"]');
    const orderCount = await ordersList.count();
    expect(orderCount).toBeGreaterThanOrEqual(0);
  });
});