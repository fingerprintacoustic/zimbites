import { Page, Locator } from "@playwright/test";
import { BasePage } from "./base-page";

/**
 * Restaurant Dashboard Page Object
 */
export class RestaurantDashboardPage extends BasePage {
  readonly pendingOrders: Locator;
  readonly acceptedOrders: Locator;
  readonly ordersList: Locator;
  readonly acceptButton: Locator;
  readonly rejectButton: Locator;
  readonly startPreparingButton: Locator;
  readonly markReadyButton: Locator;

  constructor(page: Page) {
    super(page);
    this.pendingOrders = page.locator('[data-testid="pending-orders"], .pending-orders');
    this.acceptedOrders = page.locator('[data-testid="accepted-orders"], .accepted-orders');
    this.ordersList = page.locator('[data-testid="order-card"], .order-card');
    this.acceptButton = page.locator('button:has-text("Accept"), button:has-text("Confirm")');
    this.rejectButton = page.locator('button:has-text("Reject"), button:has-text("Decline")');
    this.startPreparingButton = page.locator('button:has-text("Start Preparing"), button:has-text("Preparing")');
    this.markReadyButton = page.locator('button:has-text("Mark Ready"), button:has-text("Ready")');
  }

  async goto(): Promise<void> {
    await this.navigate("/restaurant-dashboard");
  }

  /**
   * Get pending orders count
   */
  async getPendingOrdersCount(): Promise<number> {
    const pendingSection = this.pendingOrders;
    if (await pendingSection.isVisible()) {
      const orders = pendingSection.locator('[data-testid="order-card"], .order-card');
      return orders.count();
    }
    return 0;
  }

  /**
   * Get all pending orders
   */
  async getPendingOrders(): Promise<string[]> {
    const orders = this.pendingOrders.locator('[data-testid="order-card"], .order-card');
    const count = await orders.count();
    const orderIds: string[] = [];

    for (let i = 0; i < count; i++) {
      const text = await orders.nth(i).textContent();
      if (text) orderIds.push(text);
    }

    return orderIds;
  }

  /**
   * Accept an order by index
   */
  async acceptOrder(index: number = 0): Promise<void> {
    const orders = this.ordersList;
    const order = orders.nth(index);
    const acceptBtn = order.locator('button:has-text("Accept"), button:has-text("Confirm")');
    await acceptBtn.click();
    await this.waitForPageLoad();
  }

  /**
   * Reject an order by index
   */
  async rejectOrder(index: number = 0): Promise<void> {
    const orders = this.ordersList;
    const order = orders.nth(index);
    const rejectBtn = order.locator('button:has-text("Reject"), button:has-text("Decline")');
    await rejectBtn.click();
    await this.waitForPageLoad();
  }

  /**
   * Start preparing an order
   */
  async startPreparing(index: number = 0): Promise<void> {
    const orders = this.ordersList;
    const order = orders.nth(index);
    const prepareBtn = order.locator('button:has-text("Start Preparing"), button:has-text("Preparing")');
    await prepareBtn.click();
    await this.waitForPageLoad();
  }

  /**
   * Mark order as ready for pickup
   */
  async markReady(index: number = 0): Promise<void> {
    const orders = this.ordersList;
    const order = orders.nth(index);
    const readyBtn = order.locator('button:has-text("Mark Ready"), button:has-text("Ready")');
    await readyBtn.click();
    await this.waitForPageLoad();
  }

  /**
   * Check if there are new orders
   */
  async hasNewOrders(): Promise<boolean> {
    const notification = this.page.locator('text=/new order|pending order/i');
    return notification.isVisible().catch(() => false);
  }
}