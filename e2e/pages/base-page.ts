import { Page, Locator } from "@playwright/test";

/**
 * Base page object with common functionality
 */
export abstract class BasePage {
  protected page: Page;
  protected baseUrl: string;

  constructor(page: Page, baseUrl: string = process.env.BASE_URL || "http://localhost:3000") {
    this.page = page;
    this.baseUrl = baseUrl;
  }

  async navigate(path: string): Promise<void> {
    await this.page.goto(`${this.baseUrl}${path}`);
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState("networkidle");
  }

  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  async isVisible(locator: Locator): Promise<boolean> {
    return locator.isVisible().catch(() => false);
  }

  async waitForSelector(selector: string, options?: { timeout?: number }): Promise<void> {
    await this.page.waitForSelector(selector, { state: "visible", ...options });
  }

  async click(selector: string): Promise<void> {
    await this.page.click(selector);
  }

  async fill(selector: string, value: string): Promise<void> {
    await this.page.fill(selector, value);
  }

  async getText(selector: string): Promise<string> {
    return (await this.page.textContent(selector)) || "";
  }

  async isOnPath(path: string): Promise<boolean> {
    return this.page.url().includes(path);
  }

  async scrollTo(selector: string): Promise<void> {
    const element = this.page.locator(selector).first();
    await element.scrollIntoViewIfNeeded();
  }
}