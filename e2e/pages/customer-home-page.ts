import { Page, Locator } from "@playwright/test";
import { BasePage } from "./base-page";

/**
 * Customer Home Page Object
 */
export class CustomerHomePage extends BasePage {
  readonly restaurantCards: Locator;
  readonly searchInput: Locator;
  readonly cartButton: Locator;

  constructor(page: Page) {
    super(page);
    this.restaurantCards = page.locator('[data-testid="restaurant-card"], .restaurant-card, [class*="restaurant"]');
    this.searchInput = page.locator('input[placeholder*="Search"], input[type="search"]');
    this.cartButton = page.locator('[data-testid="cart-button"], button:has-text("Cart"), a:has-text("Cart")');
  }

  async goto(): Promise<void> {
    await this.navigate("/home");
  }

  /**
   * Get all restaurant names on the page
   */
  async getRestaurantNames(): Promise<string[]> {
    const cards = this.restaurantCards;
    const count = await cards.count();
    const names: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const name = await cards.nth(i).textContent();
      if (name) names.push(name);
    }
    
    return names;
  }

  /**
   * Click on a restaurant card by name
   */
  async selectRestaurant(name: string): Promise<void> {
    const cards = this.restaurantCards;
    const count = await cards.count();
    
    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      const text = await card.textContent();
      if (text && text.toLowerCase().includes(name.toLowerCase())) {
        await card.click();
        await this.waitForPageLoad();
        return;
      }
    }
    
    throw new Error(`Restaurant "${name}" not found`);
  }

  /**
   * Search for a restaurant
   */
  async searchRestaurant(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.waitForPageLoad();
  }

  /**
   * Go to cart
   */
  async goToCart(): Promise<void> {
    await this.cartButton.click();
    await this.waitForPageLoad();
  }

  /**
   * Check if user is logged in
   */
  async isLoggedIn(): Promise<boolean> {
    const logoutButton = this.page.locator('button:has-text("Logout"), button:has-text("Sign Out")');
    return logoutButton.isVisible().catch(() => false);
  }
}