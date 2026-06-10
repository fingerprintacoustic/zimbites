import { test, expect, Page } from "@playwright/test";
import { LoginPage } from "./pages";
import { TEST_ACCOUNTS } from "./test-data";

test.describe("Authentication Tests", () => {
  let page: Page;
  let loginPage: LoginPage;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    loginPage = new LoginPage(page);
  });

  test.afterEach(async () => {
    await page.close();
  });

  test("should display login page correctly", async () => {
    await loginPage.goto();
    
    // Verify page title
    await expect(page).toHaveTitle(/Zimbites/);
    
    // Verify login form elements
    const openIdInput = page.locator('input[placeholder*="OpenID"]');
    await expect(openIdInput).toBeVisible();
    
    const signInButton = page.locator('button:has-text("Sign In")');
    await expect(signInButton).toBeVisible();
  });

  test("should show demo account buttons", async () => {
    await loginPage.goto();
    
    // Check for all demo account buttons
    const customerButton = page.locator('button:has-text("Customer")');
    const restaurantButton = page.locator('button:has-text("Restaurant")');
    const driverButton = page.locator('button:has-text("Driver")');
    const adminButton = page.locator('button:has-text("Admin")');
    
    await expect(customerButton).toBeVisible();
    await expect(restaurantButton).toBeVisible();
    await expect(driverButton).toBeVisible();
    await expect(adminButton).toBeVisible();
  });

  test("should login with customer account", async () => {
    await loginPage.goto();
    await loginPage.quickLogin("customer");
    
    // Verify redirect after login
    await page.waitForURL(/\/(home|restaurant)/, { timeout: 10000 });
    
    // Verify logged in state
    const dashboardElement = page.locator('[class*="dashboard"], [class*="home"]');
    await expect(dashboardElement.first()).toBeVisible();
  });

  test("should login with restaurant account", async () => {
    await loginPage.goto();
    await loginPage.quickLogin("restaurant");
    
    // Verify redirect to restaurant dashboard
    await page.waitForURL(/\/restaurant-dashboard/, { timeout: 10000 });
    
    // Verify restaurant dashboard loaded
    const dashboard = page.locator('[class*="dashboard"], h1');
    await expect(dashboard.first()).toBeVisible();
  });

  test("should login with driver account", async () => {
    await loginPage.goto();
    await loginPage.quickLogin("driver");
    
    // Verify redirect to driver dashboard
    await page.waitForURL(/\/driver-dashboard/, { timeout: 10000 });
    
    // Verify driver dashboard loaded
    const dashboard = page.locator('[class*="dashboard"], h1');
    await expect(dashboard.first()).toBeVisible();
  });

  test("should login with admin account", async () => {
    await loginPage.goto();
    await loginPage.quickLogin("admin");
    
    // Verify redirect to admin dashboard
    await page.waitForURL(/\/admin-dashboard/, { timeout: 10000 });
    
    // Verify admin dashboard loaded
    const dashboard = page.locator('[class*="dashboard"], h1');
    await expect(dashboard.first()).toBeVisible();
  });

  test("should login with custom OpenID", async () => {
    await loginPage.goto();
    await loginPage.loginWithOpenId(TEST_ACCOUNTS.customer.openId);
    
    // Verify login successful
    await page.waitForLoadState("networkidle");
    
    // Should be redirected to authenticated area
    const currentUrl = page.url();
    expect(currentUrl).not.toContain("/login");
  });

  test("should handle invalid OpenID gracefully", async () => {
    await loginPage.goto();
    
    // Try to login with invalid OpenID
    await loginPage.loginWithOpenId("invalid-openid-12345");
    
    // Wait for any error or redirect
    await page.waitForTimeout(2000);
    
    // Should either show error or stay on login page
    const stillOnLogin = page.url().includes("/login");
    const hasError = await page.locator('text=/error|invalid|not found/i').isVisible().catch(() => false);
    
    expect(stillOnLogin || hasError).toBeTruthy();
  });

  test("should logout successfully", async () => {
    // Login first
    await loginPage.goto();
    await loginPage.quickLogin("customer");
    await page.waitForURL(/\/(home|restaurant)/);
    
    // Find and click logout button
    const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign Out"), a:has-text("Logout")');
    
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await page.waitForLoadState("networkidle");
      
      // Should redirect to login or home page
      await page.waitForURL(/\/(login|\/)$/, { timeout: 5000 });
    }
  });

  test("should remember login state across pages", async () => {
    // Login
    await loginPage.goto();
    await loginPage.quickLogin("customer");
    await page.waitForURL(/\/(home|restaurant)/);
    
    // Navigate to different pages
    await page.goto("/orders");
    await page.waitForLoadState("networkidle");
    
    // Should not be redirected to login (session maintained)
    const onOrdersPage = page.url().includes("/orders");
    expect(onOrdersPage).toBeTruthy();
  });

  test("should redirect unauthenticated users to login", async ({ page: newPage }) => {
    // Try to access protected page without login
    await newPage.goto("/home");
    await newPage.waitForLoadState("networkidle");
    
    // Should redirect to login page
    await newPage.waitForURL(/\/login/, { timeout: 5000 });
    
    // Login button should be visible
    const loginButton = newPage.locator('button:has-text("Sign In")');
    await expect(loginButton).toBeVisible();
  });

  test("should show role-specific dashboard after login", async () => {
    const roles = ["customer", "restaurant", "driver", "admin"] as const;
    const expectedPaths = {
      customer: ["/home", "/restaurant"],
      restaurant: ["/restaurant-dashboard"],
      driver: ["/driver-dashboard"],
      admin: ["/admin-dashboard"],
    };

    for (const role of roles) {
      const context = await page.context().browser()?.newContext() || page.context();
      const rolePage = await context.newPage();
      const roleLoginPage = new LoginPage(rolePage);

      await roleLoginPage.goto();
      await roleLoginPage.quickLogin(role);
      
      // Check URL matches expected path
      await rolePage.waitForURL(new RegExp(expectedPaths[role].join("|")), { timeout: 10000 });
      
      // Verify page has content
      const body = rolePage.locator("body");
      await expect(body).toBeVisible();
      
      await rolePage.close();
    }
  });
});