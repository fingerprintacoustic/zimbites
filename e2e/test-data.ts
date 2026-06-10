/**
 * Test data and constants for E2E tests
 */

export const TEST_ACCOUNTS = {
  customer: {
    openId: "customer-demo-001",
    email: "john@example.com",
    password: "ChangeMe123!",
  },
  restaurant: {
    openId: "restaurant-demo-001",
    email: "marcus@zimbites.com",
    password: "ChangeMe123!",
  },
  driver: {
    openId: "driver-demo-001",
    email: "david.driver@zimbites.com",
    password: "ChangeMe123!",
  },
  admin: {
    openId: "admin-demo-001",
    email: "admin@zimbites.com",
    password: "ChangeMe123!",
  },
};

export const TEST_DELIVERY_ADDRESS = "123 Test Street, Harare, Zimbabwe";

export const TEST_PAYMENT_METHOD = "Cash on Delivery";

export const ORDER_STATUS_FLOW = [
  "pending",
  "accepted",
  "preparing",
  "ready_for_pickup",
  "driver_assigned",
  "picked_up",
  "out_for_delivery",
  "delivered",
  "customer_confirmed",
] as const;

export type OrderStatus = (typeof ORDER_STATUS_FLOW)[number];