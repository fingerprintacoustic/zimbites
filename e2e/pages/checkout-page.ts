import { Page, Locator } from "@playwright/test";
import { BasePage } from "./base-page";

/**
 * Checkout Page Object
 */
export class CheckoutPage extends BasePage {
  readonly deliveryAddressInput: Locator;
  readonly paymentMethodSelect: Locator;
  readonly tipInput: Locator;
  readonly placeOrderButton: Locator;
  readonly orderSummary: Locator;
  readonly cartItems: Locator;
  readonly subtotalDisplay: Locator;
  readonly totalDisplay: Locator;

  constructor(page: Page) {
    super(page);
    this.deliveryAddressInput = page.locator('input[id*="address"], input[placeholder*="address"], textarea[id*="address"]');
    this.paymentMethodSelect = page.locator('select[id*="payment"], [role="combobox"]:has-text("Payment")');
    this.tipInput = page.locator('input[id*="tip"], input[placeholder*="tip"]');
    this.placeOrderButton = page.locator('button:has-text("Place Order"), button:has-text("Submit Order"), button:has-text("Confirm Order")');
    this.orderSummary = page.locator('[data-testid="order-summary"], .order-summary');
    this.cartItems = page.locator('[data-testid="cart-item"], .cart-item');
    this.subtotalDisplay = page.locator('[data-testid="subtotal"], .subtotal, text=/subtotal/i');
    this.totalDisplay = page.locator('[data-testid="total"], .total, text=/total/i');
  }

  async goto(): Promise<void> {
    await this.navigate("/checkout");
  }

  /**
   * Set delivery address
   */
  async setDeliveryAddress(address: string): Promise<void> {
    await this.deliveryAddressInput.fill(address);
  }

  /**
   * Select payment method
   */
  async selectPaymentMethod(method: string): Promise<void> {
    const select = this.paymentMethodSelect;
    if (await select.isVisible()) {
      await select.selectOption({ label: method });
    } else {
      const option = this.page.locator(`option:has-text("${method}")`);
      await this.paymentMethodSelect.selectOption({ label: method });
    }
  }

  /**
   * Set tip amount
   */
  async setTip(amount: string): Promise<void> {
    await this.tipInput.fill(amount);
  }

  /**
   * Get cart items count
   */
  async getCartItemsCount(): Promise<number> {
    return this.cartItems.count();
  }

  /**
   * Place order
   */
  async placeOrder(): Promise<void> {
    await this.placeOrderButton.click();
    await this.waitForPageLoad();
  }

  /**
   * Complete checkout with all details
   */
  async completeCheckout(address: string, paymentMethod: string, tip?: string): Promise<void> {
    await this.setDeliveryAddress(address);
    await this.selectPaymentMethod(paymentMethod);
    if (tip) {
      await this.setTip(tip);
    }
    await this.placeOrder();
  }

  /**
   * Check if order confirmation is shown
   */
  async isOrderConfirmed(): Promise<boolean> {
    const confirmation = this.page.locator('text=/order.*confirmed|success|thank you/i');
    return confirmation.isVisible().catch(() => false);
  }

  /**
   * Get order number
   */
  async getOrderNumber(): Promise<string> {
    const orderNumberElement = this.page.locator('[data-testid="order-number"], .order-number, text=/#\\d+/').first();
    return (await orderNumberElement.textContent()) || "";
  }
}