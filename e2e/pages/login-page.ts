import { Page } from "@playwright/test";
import { BasePage } from "./base-page";

/**
 * Login Page Object
 */
export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to login page
   */
  async goto(): Promise<void> {
    await this.navigate("/login");
  }

  /**
   * Login with OpenID
   */
  async loginWithOpenId(openId: string): Promise<void> {
    await this.fill('input[placeholder*="OpenID"]', openId);
    await this.click('button:has-text("Sign In")');
    await this.waitForPageLoad();
  }

  /**
   * Quick login with demo account button
   */
  async quickLogin(role: "customer" | "restaurant" | "driver" | "admin"): Promise<void> {
    const roleButtons: Record<string, string> = {
      customer: 'button:has-text("Customer")',
      restaurant: 'button:has-text("Restaurant")',
      driver: 'button:has-text("Driver")',
      admin: 'button:has-text("Admin")',
    };
    await this.click(roleButtons[role]);
    await this.waitForPageLoad();
  }

  /**
   * Check if login form is visible
   */
  async isLoginFormVisible(): Promise<boolean> {
    return this.page.locator('input[placeholder*="OpenID"]').isVisible().catch(() => false);
  }
}