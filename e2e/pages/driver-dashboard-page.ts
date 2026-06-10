import { Page, Locator } from "@playwright/test";
import { BasePage } from "./base-page";

/**
 * Driver Dashboard Page Object
 */
export class DriverDashboardPage extends BasePage {
  readonly availableOrders: Locator;
  readonly activeDeliveries: Locator;
  readonly earningsDisplay: Locator;
  readonly acceptDeliveryButton: Locator;
  readonly confirmPickupButton: Locator;
  readonly outForDeliveryButton: Locator;
  readonly confirmDeliveryButton: Locator;
  readonly statusToggle: Locator;

  constructor(page: Page) {
    super(page);
    this.availableOrders = page.locator('[data-testid="available-orders"], .available-orders');
    this.activeDeliveries = page.locator('[data-testid="active-deliveries"], .active-deliveries');
    this.earningsDisplay = page.locator('[data-testid="earnings"], .earnings, text=/\\$|ZWL/i');
    this.acceptDeliveryButton = page.locator('button:has-text("Accept"), button:has-text("Pick Up")');
    this.confirmPickupButton = page.locator('button:has-text("Confirm Pickup"), button:has-text("Picked Up")');
    this.outForDeliveryButton = page.locator('button:has-text("Out for Delivery"), button:has-text("Delivering")');
    this.confirmDeliveryButton = page.locator('button:has-text("Confirm Delivery"), button:has-text("Delivered")');
    this.statusToggle = page.locator('[data-testid="status-toggle"], button:has-text("Online"), button:has-text("Offline")');
  }

  async goto(): Promise<void> {
    await this.navigate("/driver-dashboard");
  }

  /**
   * Get available orders count
   */
  async getAvailableOrdersCount(): Promise<number> {
    const orders = this.availableOrders.locator('[data-testid="delivery-card"], .delivery-card, [class*="order"]');
    return orders.count();
  }

  /**
   * Get available orders details
   */
  async getAvailableOrders(): Promise<string[]> {
    const orders = this.availableOrders.locator('[data-testid="delivery-card"], .delivery-card');
    const count = await orders.count();
    const details: string[] = [];

    for (let i = 0; i < count; i++) {
      const text = await orders.nth(i).textContent();
      if (text) details.push(text);
    }

    return details;
  }

  /**
   * Accept a delivery
   */
  async acceptDelivery(index: number = 0): Promise<void> {
    const orders = this.availableOrders.locator('[data-testid="delivery-card"], .delivery-card');
    const order = orders.nth(index);
    const acceptBtn = order.locator('button:has-text("Accept"), button:has-text("Pick Up")');
    await acceptBtn.click();
    await this.waitForPageLoad();
  }

  /**
   * Confirm pickup
   */
  async confirmPickup(index: number = 0): Promise<void> {
    const deliveries = this.activeDeliveries.locator('[data-testid="delivery-card"], .delivery-card');
    const delivery = deliveries.nth(index);
    const pickupBtn = delivery.locator('button:has-text("Confirm Pickup"), button:has-text("Picked Up")');
    await pickupBtn.click();
    await this.waitForPageLoad();
  }

  /**
   * Mark as out for delivery
   */
  async markOutForDelivery(index: number = 0): Promise<void> {
    const deliveries = this.activeDeliveries.locator('[data-testid="delivery-card"], .delivery-card');
    const delivery = deliveries.nth(index);
    const deliverBtn = delivery.locator('button:has-text("Out for Delivery"), button:has-text("Delivering")');
    await deliverBtn.click();
    await this.waitForPageLoad();
  }

  /**
   * Confirm delivery
   */
  async confirmDelivery(index: number = 0): Promise<void> {
    const deliveries = this.activeDeliveries.locator('[data-testid="delivery-card"], .delivery-card');
    const delivery = deliveries.nth(index);
    const confirmBtn = delivery.locator('button:has-text("Confirm Delivery"), button:has-text("Delivered")');
    await confirmBtn.click();
    await this.waitForPageLoad();
  }

  /**
   * Toggle driver online/offline status
   */
  async toggleStatus(): Promise<void> {
    await this.statusToggle.click();
    await this.waitForPageLoad();
  }

  /**
   * Get current earnings
   */
  async getEarnings(): Promise<string> {
    return (await this.earningsDisplay.textContent()) || "";
  }

  /**
   * Check if driver is online
   */
  async isOnline(): Promise<boolean> {
    const onlineStatus = this.page.locator('text=/online|available/i');
    const offlineStatus = this.page.locator('text=/offline|unavailable/i');
    const isOnline = await onlineStatus.isVisible().catch(() => false);
    const isOffline = await offlineStatus.isVisible().catch(() => false);
    return isOnline && !isOffline;
  }
}