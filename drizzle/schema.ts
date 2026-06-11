import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  password: varchar("password", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["customer", "restaurant", "driver", "admin"]).default("customer").notNull(),
  imageUrl: varchar("imageUrl", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Cart
export const carts = mysqlTable("carts", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId").notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Cart = typeof carts.$inferSelect;
export type InsertCart = typeof carts.$inferInsert;

export const cartItems = mysqlTable("cartItems", {
  id: int("id").autoincrement().primaryKey(),
  cartId: int("cartId").notNull(),
  menuItemId: int("menuItemId").notNull(),
  quantity: int("quantity").default(1).notNull(),
  price: int("price").notNull(), // price at time of adding to cart
  currency: mysqlEnum("currency", ["USD", "ZWL"]).default("ZWL").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = typeof cartItems.$inferInsert;

// Restaurant
export const restaurants = mysqlTable("restaurants", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: varchar("imageUrl", { length: 512 }),
  address: text("address").notNull(),
  latitude: varchar("latitude", { length: 50 }),
  longitude: varchar("longitude", { length: 50 }),
  phoneNumber: varchar("phoneNumber", { length: 20 }),
  deliveryRadius: int("deliveryRadius").default(15).notNull(), // in km
  minOrderAmount: int("minOrderAmount").default(0).notNull(), // in cents
  isActive: int("isActive").default(1).notNull(),
  isApproved: int("isApproved").default(0).notNull(),
  bankAccountName: varchar("bankAccountName", { length: 255 }),
  bankAccountNumber: varchar("bankAccountNumber", { length: 255 }),
  bankName: varchar("bankName", { length: 255 }),
  bankBranch: varchar("bankBranch", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Restaurant = typeof restaurants.$inferSelect;
export type InsertRestaurant = typeof restaurants.$inferInsert;

// Menu Category
export const menuCategories = mysqlTable("menuCategories", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  displayOrder: int("displayOrder").default(0).notNull(),
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MenuCategory = typeof menuCategories.$inferSelect;
export type InsertMenuCategory = typeof menuCategories.$inferInsert;

// Menu Item
export const menuItems = mysqlTable("menuItems", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull(),
  categoryId: int("categoryId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: int("price").notNull(), // in cents
  currency: mysqlEnum("currency", ["USD", "ZWL"]).default("ZWL").notNull(),
  imageUrl: varchar("imageUrl", { length: 512 }),
  isAvailable: int("isAvailable").default(1).notNull(),
  preparationTime: int("preparationTime").default(15).notNull(), // in minutes
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = typeof menuItems.$inferInsert;

// Order
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  orderNumber: varchar("orderNumber", { length: 50 }).notNull().unique(),
  customerId: int("customerId").notNull(),
  restaurantId: int("restaurantId").notNull(),
  driverId: int("driverId"),
  status: mysqlEnum("status", [
    "pending",
    "accepted",
    "preparing",
    "ready_for_pickup",
    "driver_assigned",
    "picked_up",
    "out_for_delivery",
    "delivered",
    "customer_confirmed",
    "cancelled",
    "rejected",
    "refunded",
  ]).default("pending").notNull(),
  deliveryAddress: text("deliveryAddress").notNull(),
  deliveryLatitude: varchar("deliveryLatitude", { length: 50 }),
  deliveryLongitude: varchar("deliveryLongitude", { length: 50 }),
  deliveryNotes: text("deliveryNotes"),
  subtotal: int("subtotal").notNull(), // in cents
  deliveryFee: int("deliveryFee").notNull(), // in cents
  tax: int("tax").default(0).notNull(), // in cents
  discount: int("discount").default(0).notNull(), // in cents
  platformCommission: int("platformCommission").notNull(), // in cents
  tip: int("tip").default(0).notNull(), // in cents
  total: int("total").notNull(), // in cents
  currency: mysqlEnum("currency", ["USD", "ZWL"]).default("ZWL").notNull(),
  paymentMethod: varchar("paymentMethod", { length: 50 }).notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "completed", "failed", "refunded"]).default("pending").notNull(),
  paymentReference: varchar("paymentReference", { length: 255 }),
  estimatedDeliveryTime: timestamp("estimatedDeliveryTime"),
  pickedUpAt: timestamp("pickedUpAt"),
  deliveredAt: timestamp("deliveredAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

// Order Status History
export const orderStatusHistory = mysqlTable("orderStatusHistory", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  notes: text("notes"),
  createdBy: int("createdBy"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type OrderStatusHistory = typeof orderStatusHistory.$inferSelect;
export type InsertOrderStatusHistory = typeof orderStatusHistory.$inferInsert;

// Order Item (line items in order with name for historical reference)
export const orderItems = mysqlTable("orderItems", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  menuItemId: int("menuItemId").notNull(),
  name: varchar("name", { length: 255 }).notNull(), // Store name at time of order
  quantity: int("quantity").notNull(),
  price: int("price").notNull(), // price at time of order (in cents)
  subtotal: int("subtotal").notNull(), // quantity * price (in cents)
  currency: mysqlEnum("currency", ["USD", "ZWL"]).default("ZWL").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

// Driver
export const drivers = mysqlTable("drivers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  phoneNumber: varchar("phoneNumber", { length: 20 }).notNull(),
  vehicleType: varchar("vehicleType", { length: 50 }).notNull(), // motorcycle, car, etc
  licensePlate: varchar("licensePlate", { length: 50 }),
  status: mysqlEnum("status", ["available", "on_delivery", "offline", "suspended"]).default("offline").notNull(),
  currentLatitude: varchar("currentLatitude", { length: 50 }),
  currentLongitude: varchar("currentLongitude", { length: 50 }),
  lastLocationUpdate: timestamp("lastLocationUpdate"),
  isApproved: int("isApproved").default(0).notNull(),
  totalDeliveries: int("totalDeliveries").default(0).notNull(),
  averageRating: varchar("averageRating", { length: 10 }).default("0.0").notNull(),
  totalEarnings: int("totalEarnings").default(0).notNull(), // in cents
  walletBalance: int("walletBalance").default(0).notNull(), // in cents
  bankAccountName: varchar("bankAccountName", { length: 255 }),
  bankAccountNumber: varchar("bankAccountNumber", { length: 255 }),
  bankName: varchar("bankName", { length: 255 }),
  bankBranch: varchar("bankBranch", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Driver = typeof drivers.$inferSelect;
export type InsertDriver = typeof drivers.$inferInsert;

// Driver Assignment
export const driverAssignments = mysqlTable("driverAssignments", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  driverId: int("driverId").notNull(),
  status: mysqlEnum("status", ["pending", "accepted", "picked_up", "completed"]).default("pending").notNull(),
  assignedAt: timestamp("assignedAt").defaultNow().notNull(),
  acceptedAt: timestamp("acceptedAt"),
  pickedUpAt: timestamp("pickedUpAt"),
  deliveredAt: timestamp("deliveredAt"),
  currentLatitude: decimal("currentLatitude", { precision: 10, scale: 8 }),
  currentLongitude: decimal("currentLongitude", { precision: 11, scale: 8 }),
  lastLocationUpdate: timestamp("lastLocationUpdate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DriverAssignment = typeof driverAssignments.$inferSelect;
export type InsertDriverAssignment = typeof driverAssignments.$inferInsert;

// Payment
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  amount: int("amount").notNull(), // in cents
  method: varchar("method", { length: 50 }).notNull(),
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("pending").notNull(),
  reference: varchar("reference", { length: 255 }),
  transactionId: varchar("transactionId", { length: 255 }),
  metadata: text("metadata"), // JSON
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

// Driver Wallet
export const driverWallets = mysqlTable("driverWallets", {
  id: int("id").autoincrement().primaryKey(),
  driverId: int("driverId").notNull().unique(),
  availableBalance: int("availableBalance").default(0).notNull(), // in cents
  pendingEarnings: int("pendingEarnings").default(0).notNull(), // in cents
  totalEarnings: int("totalEarnings").default(0).notNull(), // in cents
  totalTips: int("totalTips").default(0).notNull(), // in cents
  withdrawalMethod: mysqlEnum("withdrawalMethod", ["bank_transfer", "mobile_money", "cash"]).default("bank_transfer").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DriverWallet = typeof driverWallets.$inferSelect;
export type InsertDriverWallet = typeof driverWallets.$inferInsert;

// Tip
export const tips = mysqlTable("tips", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  driverId: int("driverId").notNull(),
  customerId: int("customerId").notNull(),
  amount: int("amount").notNull(), // in cents
  givenAt: timestamp("givenAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Tip = typeof tips.$inferSelect;
export type InsertTip = typeof tips.$inferInsert;

// Rating/Review
export const ratings = mysqlTable("ratings", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  customerId: int("customerId").notNull(),
  restaurantId: int("restaurantId"),
  driverId: int("driverId"),
  rating: int("rating").notNull(), // 1-5
  comment: text("comment"),
  ratedAt: timestamp("ratedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Rating = typeof ratings.$inferSelect;
export type InsertRating = typeof ratings.$inferInsert;

// Platform Settings
export const platformSettings = mysqlTable("platformSettings", {
  id: int("id").autoincrement().primaryKey(),
  settingKey: varchar("settingKey", { length: 255 }).notNull().unique(),
  settingValue: text("settingValue").notNull(), // JSON
  description: text("description"),
  updatedBy: int("updatedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PlatformSetting = typeof platformSettings.$inferSelect;
export type InsertPlatformSetting = typeof platformSettings.$inferInsert;

// Payouts
export const payouts = mysqlTable("payouts", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId"),
  driverId: int("driverId"),
  amount: int("amount").notNull(), // in cents
  currency: mysqlEnum("currency", ["USD", "ZWL"]).default("ZWL").notNull(),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed", "cancelled"]).default("pending").notNull(),
  payoutMethod: mysqlEnum("payoutMethod", ["bank_transfer", "mobile_money", "cash"]).default("bank_transfer").notNull(),
  reference: varchar("reference", { length: 255 }),
  notes: text("notes"),
  processedAt: timestamp("processedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Payout = typeof payouts.$inferSelect;
export type InsertPayout = typeof payouts.$inferInsert;

// Notifications
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: mysqlEnum("type", ["order", "delivery", "promo", "system"]).default("system").notNull(),
  isRead: int("isRead").default(0).notNull(),
  metadata: text("metadata"), // JSON - stores related entity IDs (orderId, etc)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;