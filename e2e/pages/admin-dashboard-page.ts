import { Page, Locator } from "@playwright/test";
import { BasePage } from "./base-page";

/**
 * Admin Dashboard Page Object
 */
export class AdminDashboardPage extends BasePage {
  readonly statsCards: Locator;
  readonly usersList: Locator;
  readonly restaurantsList: Locator;
  readonly ordersList: Locator;
  readonly approveButton: Locator;
  readonly rejectButton: Locator;

  constructor(page: Page) {
    super(page);
    this.statsCards = page.locator('[data-testid="stat-card"], .stat-card');
    this.usersList = page.locator('[data-testid="user-row"], .user-row');
    this.restaurantsList = page.locator('[data-testid="restaurant-row"], .restaurant-row');
    this.ordersList = page.locator('[data-testid="order-row"], .order-row');
    this.approveButton = page.locator('button:has-text("Approve"), button:has-text("Accept")');
    this.rejectButton = page.locator('button:has-text("Reject"), button:has-text("Decline")');
  }

  async goto(): Promise<void> {
    await this.navigate("/admin-dashboard");
  }

  /**
   * Get platform statistics
   */
  async getStats(): Promise<Record<string, string>> {
    const stats: Record<string, string> = {};
    const cards = this.statsCards;
    const count = await cards.count();

    for (let i = 0; i < count; i++) {
      const text = await cards.nth(i).textContent();
      if (text) {
        const match = text.match(/(\w+):\s*(\d+)/);
        if (match) {
          stats[match[1]] = match[2];
        }
      }
    }

    return stats;
  }

  /**
   * Get users count
   */
  async getUsersCount(): Promise<number> {
    return this.usersList.count();
  }

  /**
   * Get restaurants count
   */
  async getRestaurantsCount(): Promise<number> {
    return this.restaurantsList.count();
  }

  /**
   * Get orders count
   */
  async getOrdersCount(): Promise<number> {
    return this.ordersList.count();
  }

  /**
   * Approve an entity (restaurant or driver)
   */
  async approve(index: number = 0): Promise<void> {
    const approveBtn = this.approveButton.nth(index);
    await approveBtn.click();
    await this.waitForPageLoad();
  }

  /**
   * Reject an entity
   */
  async reject(index: number = 0): Promise<void> {
    const rejectBtn = this.rejectButton.nth(index);
    await rejectBtn.click();
    await this.waitForPageLoad();
  }

  /**
   * Navigate to a specific tab
   */
  async selectTab(tabName: "users" | "restaurants" | "orders"): Promise<void> {
    await this.click(`button:has-text("${tabName}"), a:has-text("${tabName}")`);
    await this.waitForPageLoad();
  }
}