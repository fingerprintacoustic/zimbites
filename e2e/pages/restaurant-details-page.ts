import { Page, Locator } from "@playwright/test";
import { BasePage } from "./base-page";

/**
 * Restaurant Details Page Object
 */
export class RestaurantDetailsPage extends BasePage {
  readonly menuItems: Locator;
  readonly addToCartButtons: Locator;
  readonly cartBadge: Locator;
  readonly checkoutButton: Locator;
  readonly backButton: Locator;

  constructor(page: Page) {
    super(page);
    this.menuItems = page.locator('[data-testid="menu-item"], .menu-item, [class*="menu-item"]');
    this.addToCartButtons = page.locator('button:has-text("Add"), button:has-text("Add to Cart")');
    this.cartBadge = page.locator('[data-testid="cart-badge"], .cart-badge, [class*="cart-badge"]');
    this.checkoutButton = page.locator('button:has-text("Checkout"), button:has-text("Proceed to Checkout"), a:has-text("Checkout")');
    this.backButton = page.locator('button:has-text("Back"), a:has-text("Back")');
  }

  /**
   * Navigate to a specific restaurant
   */
  async goto(restaurantId: string | number): Promise<void> {
    await this.navigate(`/restaurant/${restaurantId}`);
  }

  /**
   * Get restaurant name
   */
  async getRestaurantName(): Promise<string> {
    const heading = this.page.locator("h1, h2").first();
    return (await heading.textContent()) || "";
  }

  /**
   * Get all menu item names
   */
  async getMenuItemNames(): Promise<string[]> {
    const items = this.menuItems;
    const count = await items.count();
    const names: string[] = [];

    for (let i = 0; i < count; i++) {
      const name = await items.nth(i).textContent();
      if (name) names.push(name);
    }

    return names;
  }

  /**
   * Add item to cart by name
   */
  async addItemToCart(itemName: string): Promise<void> {
    const items = this.menuItems;
    const count = await items.count();

    for (let i = 0; i < count; i++) {
      const item = items.nth(i);
      const text = await item.textContent();
      if (text && text.toLowerCase().includes(itemName.toLowerCase())) {
        const addButton = item.locator('button:has-text("Add"), button:has-text("Add to Cart")').first();
        if (await addButton.isVisible()) {
          await addButton.click();
          await this.page.waitForTimeout(500);
          return;
        }
      }
    }

    throw new Error(`Menu item "${itemName}" not found`);
  }

  /**
   * Add multiple items to cart
   */
  async addItemsToCart(itemNames: string[]): Promise<void> {
    for (const name of itemNames) {
      await this.addItemToCart(name);
    }
  }

  /**
   * Get cart item count
   */
  async getCartItemCount(): Promise<number> {
    const badge = this.cartBadge;
    if (await badge.isVisible()) {
      const text = await badge.textContent();
      return text ? parseInt(text, 10) : 0;
    }
    return 0;
  }

  /**
   * Proceed to checkout
   */
  async proceedToCheckout(): Promise<void> {
    await this.checkoutButton.click();
    await this.waitForPageLoad();
  }

  /**
   * Check if restaurant is available
   */
  async isRestaurantOpen(): Promise<boolean> {
    const closedBanner = this.page.locator('text=/closed|unavailable|not open/i');
    return !(await closedBanner.isVisible().catch(() => false));
  }
}