import { Page, Locator } from "@playwright/test";
import { BasePage } from "./base-page";

/**
 * Order Tracking Page Object
 */
export class OrderTrackingPage extends BasePage {
  readonly orderStatus: Locator;
  readonly statusTimeline: Locator;
  readonly orderDetails: Locator;
  readonly restaurantInfo: Locator;
  readonly deliveryAddress: Locator;
  readonly estimatedTime: Locator;

  constructor(page: Page) {
    super(page);
    this.orderStatus = page.locator('[data-testid="order-status"], .order-status');
    this.statusTimeline = page.locator('[data-testid="status-timeline"], .timeline, [class*="timeline"]');
    this.orderDetails = page.locator('[data-testid="order-details"], .order-details');
    this.restaurantInfo = page.locator('[data-testid="restaurant-info"], .restaurant-info');
    this.deliveryAddress = page.locator('[data-testid="delivery-address"], .delivery-address');
    this.estimatedTime = page.locator('[data-testid="estimated-time"], .estimated-time');
  }

  /**
   * Navigate to order tracking for specific order
   */
  async goto(orderId: string | number): Promise<void> {
    await this.navigate(`/order/${orderId}`);
  }

  /**
   * Get current order status
   */
  async getOrderStatus(): Promise<string> {
    const statusElement = this.orderStatus.first();
    return (await statusElement.textContent()) || "";
  }

  /**
   * Wait for status update to a specific status
   */
  async waitForStatus(status: string, timeout: number = 30000): Promise<void> {
    await this.page.waitForFunction(
      (expectedStatus) => {
        const statusElements = document.querySelectorAll('[data-testid="order-status"], .order-status');
        return Array.from(statusElements).some(el => 
          el.textContent?.toLowerCase().includes(expectedStatus.toLowerCase())
        );
      },
      status,
      { timeout }
    );
  }

  /**
   * Get all status updates in timeline
   */
  async getStatusTimeline(): Promise<string[]> {
    const steps = this.statusTimeline.locator('[class*="step"], [class*="timeline-item"]');
    const count = await steps.count();
    const statuses: string[] = [];

    for (let i = 0; i < count; i++) {
      const text = await steps.nth(i).textContent();
      if (text) statuses.push(text);
    }

    return statuses;
  }

  /**
   * Check if order is delivered
   */
  async isDelivered(): Promise<boolean> {
    const delivered = this.page.locator('text=/delivered|completed|finished/i');
    return delivered.isVisible().catch(() => false);
  }

  /**
   * Get estimated delivery time
   */
  async getEstimatedDeliveryTime(): Promise<string> {
    return (await this.estimatedTime.textContent()) || "";
  }

  /**
   * Refresh page to get latest status
   */
  async refreshStatus(): Promise<void> {
    await this.page.reload();
    await this.waitForPageLoad();
  }

  /**
   * Check for order error
   */
  async hasError(): Promise<boolean> {
    const errorElement = this.page.locator('[data-testid="error"], .error, text=/error|failed/i');
    return errorElement.isVisible().catch(() => false);
  }
}