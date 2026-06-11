import { eq, and, desc, gte, lte, like, inArray, sql, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import type { ResultSetHeader } from "mysql2/promise";
import { 
  InsertUser, 
  users, 
  restaurants, 
  InsertRestaurant,
  menuItems,
  InsertMenuItem,
  menuCategories,
  InsertMenuCategory,
  orders,
  InsertOrder,
  orderItems,
  InsertOrderItem,
  orderStatusHistory,
  InsertOrderStatusHistory,
  drivers,
  InsertDriver,
  driverAssignments,
  InsertDriverAssignment,
  payments,
  InsertPayment,
  driverWallets,
  InsertDriverWallet,
  tips,
  InsertTip,
  ratings,
  InsertRating,
  platformSettings,
  InsertPlatformSetting,
  notifications,
  InsertNotification,
  carts,
  InsertCart,
  cartItems,
  InsertCartItem,
} from "../drizzle/schema";
import { ENV } from './_core/env';

// Helper type for insert results
type InsertResult = ResultSetHeader & { insertId?: number | bigint };

let _db: ReturnType<typeof drizzle> | null = null;
let _pool: mysql.Pool | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      // Parse URL to detect SSL requirement
      const url = new URL(process.env.DATABASE_URL);
      
      // Determine if SSL is needed based on hostname patterns
      const needsSsl = url.hostname.includes('tidbcloud') || 
                       url.hostname.includes('.sql.') || 
                       url.hostname.includes('.mysql.') ||
                       url.searchParams.has('ssl');
      
      // Create a mysql2 pool
      _pool = mysql.createPool({
        host: url.hostname,
        port: url.port ? parseInt(url.port) : 3306,
        user: url.username,
        password: url.password,
        database: url.pathname.slice(1),
        ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
      });
      
      // Create drizzle with the pool
      _db = drizzle(_pool);
      
      console.log(`[Database] Connected to ${url.hostname}:${url.port || 3306}${needsSsl ? ' (SSL)' : ''}`);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}


// Get raw mysql2 pool for direct queries
export async function getPool(): Promise<mysql.Pool | null> {
  if (!_pool) {
    await getDb();
  }
  return _pool;
}
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Restaurant queries
export async function createRestaurant(data: InsertRestaurant) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(restaurants).values(data) as unknown as InsertResult;
  return { insertId: Number(result.insertId) };
}

export async function getRestaurantById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(restaurants).where(eq(restaurants.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getRestaurantsByOwner(ownerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(restaurants).where(eq(restaurants.ownerId, ownerId));
}

export async function getApprovedRestaurants() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(restaurants).where(and(eq(restaurants.isApproved, 1), eq(restaurants.isActive, 1)));
}

export async function updateRestaurant(id: number, data: Partial<InsertRestaurant>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(restaurants).set(data).where(eq(restaurants.id, id));
}

// Menu Category queries
export async function createMenuCategory(data: InsertMenuCategory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(menuCategories).values(data) as unknown as InsertResult;
  return { insertId: Number(result.insertId) };
}

export async function getMenuCategoriesByRestaurant(restaurantId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(menuCategories)
    .where(and(eq(menuCategories.restaurantId, restaurantId), eq(menuCategories.isActive, 1)))
    .orderBy(menuCategories.displayOrder);
}

export async function updateMenuCategory(id: number, data: Partial<InsertMenuCategory>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(menuCategories).set(data).where(eq(menuCategories.id, id));
}

// Menu Item queries
export async function createMenuItem(data: InsertMenuItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(menuItems).values(data) as unknown as InsertResult;
  return { insertId: Number(result.insertId) };
}

export async function getMenuItemsByCategory(categoryId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(menuItems)
    .where(and(eq(menuItems.categoryId, categoryId), eq(menuItems.isAvailable, 1)));
}

export async function getMenuItemsByRestaurant(restaurantId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(menuItems).where(eq(menuItems.restaurantId, restaurantId));
}

export async function updateMenuItem(id: number, data: Partial<InsertMenuItem>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(menuItems).set(data).where(eq(menuItems.id, id));
}

export async function getMenuItemById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(menuItems).where(eq(menuItems.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Order queries
export async function createOrder(data: InsertOrder) {
  const pool = await getPool();
  if (!pool) throw new Error("Database not available");

  // Build insert query with only the columns that have values
  const columns: string[] = [];
  const placeholders: string[] = [];
  const values: any[] = [];

  // Only insert columns that exist in the production database
  // Some columns (tax, discount, platformCommission) might not exist
  const columnMap: Record<string, any> = {
    customerId: data.customerId,
    restaurantId: data.restaurantId,
    orderNumber: data.orderNumber,
    status: data.status || "pending",
    deliveryAddress: data.deliveryAddress,
    deliveryLatitude: data.deliveryLatitude,
    deliveryLongitude: data.deliveryLongitude,
    deliveryNotes: data.deliveryNotes,
    subtotal: data.subtotal,
    deliveryFee: data.deliveryFee,
    tax: data.tax ?? 0,
    discount: data.discount ?? 0,
    platformCommission: data.platformCommission ?? 0,
    tip: data.tip ?? 0,
    total: data.total,
    paymentMethod: data.paymentMethod,
    paymentStatus: data.paymentStatus || "pending",
    paymentReference: data.paymentReference,
    currency: data.currency,
  };

  for (const [col, val] of Object.entries(columnMap)) {
    if (val !== undefined && val !== null) {
      columns.push(col);
      placeholders.push("?");
      values.push(val);
    }
  }

  const query = `INSERT INTO orders (${columns.join(", ")}) VALUES (${placeholders.join(", ")})`;
  
  try {
    const [result]: any = await pool.query(query, values);
    const insertId = result.insertId;

    if (!insertId) {
      throw new Error("Failed to create order - no insert ID returned");
    }

    return {
      insertId: insertId,
      affectedRows: result.affectedRows || 1,
    };
  } catch (error) {
    console.error("[createOrder] SQL Error:", error);
    throw error;
  }
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOrdersByCustomer(customerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: orders.id,
    orderNumber: orders.orderNumber,
    status: orders.status,
    total: orders.total,
    createdAt: orders.createdAt,
    restaurantName: restaurants.name,
  })
    .from(orders)
    .innerJoin(restaurants, eq(orders.restaurantId, restaurants.id))
    .where(eq(orders.customerId, customerId))
    .orderBy(desc(orders.createdAt));
}

export async function getOrdersByRestaurant(restaurantId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders)
    .where(eq(orders.restaurantId, restaurantId))
    .orderBy(desc(orders.createdAt));
}

export async function getOrdersByDriver(driverId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders)
    .where(eq(orders.driverId, driverId))
    .orderBy(desc(orders.createdAt));
}

export async function getPendingOrders() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders)
    .where(eq(orders.status, "pending"))
    .orderBy(orders.createdAt);
}

export async function getReadyForPickupOrders() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders)
    .where(eq(orders.status, "ready"))
    .orderBy(orders.createdAt);
}

export async function updateOrder(id: number, data: Partial<InsertOrder>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(orders).set(data).where(eq(orders.id, id));
}

export async function updateOrderStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(orders).set({ status: status as any }).where(eq(orders.id, id));
}

// Order Item queries
export async function createOrderItems(items: InsertOrderItem[]) {
  const pool = await getPool();
  if (!pool) throw new Error("Database not available");
  
  // Use raw SQL to insert order items to ensure all fields are properly handled
  for (const item of items) {
    const query = `INSERT INTO orderItems (orderId, menuItemId, name, quantity, price, subtotal, currency) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const values = [
      item.orderId,
      item.menuItemId,
      item.name,
      item.quantity,
      item.price,
      item.subtotal || (item.quantity * item.price),
      item.currency
    ];
    
    try {
      await pool.query(query, values);
    } catch (error) {
      console.error("[createOrderItems] Error inserting item:", error);
      throw error;
    }
  }
  
  return { success: true };
}

export async function getOrderItems(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

// Driver queries
export async function createDriver(data: InsertDriver) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(drivers).values(data) as unknown as InsertResult;
  return { insertId: Number(result.insertId) };
}

export async function getDriverById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(drivers).where(eq(drivers.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getDriverByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(drivers).where(eq(drivers.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAvailableDrivers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(drivers)
    .where(and(eq(drivers.status, "available"), eq(drivers.isApproved, 1)));
}

export async function updateDriver(id: number, data: Partial<InsertDriver>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(drivers).set(data).where(eq(drivers.id, id));
}

// Payment queries
export async function createPayment(data: InsertPayment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(payments).values(data);
}

export async function getPaymentsByOrder(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(payments).where(eq(payments.orderId, orderId));
}

export async function updatePayment(id: number, data: Partial<InsertPayment>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(payments).set(data).where(eq(payments.id, id));
}

// Driver Wallet queries
export async function createDriverWallet(data: InsertDriverWallet) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(driverWallets).values(data);
}

export async function getDriverWallet(driverId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(driverWallets).where(eq(driverWallets.driverId, driverId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateDriverWallet(driverId: number, data: Partial<InsertDriverWallet>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(driverWallets).set(data).where(eq(driverWallets.driverId, driverId));
}

// Tip queries
export async function createTip(data: InsertTip) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(tips).values(data);
}

export async function getTipsByDriver(driverId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tips).where(eq(tips.driverId, driverId));
}

// Rating queries
export async function createRating(data: InsertRating) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(ratings).values(data);
}

export async function getRatingsByRestaurant(restaurantId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(ratings)
    .where(eq(ratings.restaurantId, restaurantId))
    .orderBy(desc(ratings.ratedAt));
}

export async function getRatingsByDriver(driverId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(ratings)
    .where(eq(ratings.driverId, driverId))
    .orderBy(desc(ratings.ratedAt));
}

// Platform Settings queries
export async function getPlatformSetting(key: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(platformSettings)
    .where(eq(platformSettings.settingKey, key))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function setPlatformSetting(key: string, value: string, description?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getPlatformSetting(key);
  if (existing) {
    return db.update(platformSettings)
      .set({ settingValue: value, description })
      .where(eq(platformSettings.settingKey, key));
  } else {
    return db.insert(platformSettings).values({
      settingKey: key,
      settingValue: value,
      description,
    });
  }
}

// Analytics queries
export async function getOrderStats(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select({
    totalOrders: sql<number>`COUNT(*)`,
    totalRevenue: sql<number>`SUM(${orders.total})`,
    totalCommission: sql<number>`SUM(${orders.platformCommission})`,
    totalDeliveryFees: sql<number>`SUM(${orders.deliveryFee})`,
    totalTips: sql<number>`SUM(${orders.tip})`,
  })
    .from(orders)
    .where(and(
      gte(orders.createdAt, startDate),
      lte(orders.createdAt, endDate),
      eq(orders.status, "delivered")
    ));

  return result.length > 0 ? result[0] : null;
}

export async function getRestaurantStats(restaurantId: number, startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select({
    totalOrders: sql<number>`COUNT(*)`,
    totalRevenue: sql<number>`SUM(${orders.subtotal})`,
    averageOrderValue: sql<number>`AVG(${orders.subtotal})`,
  })
    .from(orders)
    .where(and(
      eq(orders.restaurantId, restaurantId),
      gte(orders.createdAt, startDate),
      lte(orders.createdAt, endDate),
      eq(orders.status, "delivered")
    ));

  return result.length > 0 ? result[0] : null;
}

export async function getDriverStats(driverId: number, startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select({
    totalDeliveries: sql<number>`COUNT(*)`,
    totalEarnings: sql<number>`SUM(${orders.deliveryFee})`,
    totalTips: sql<number>`SUM(${orders.tip})`,
    averageRating: sql<string>`AVG(${ratings.rating})`,
  })
    .from(orders)
    .leftJoin(ratings, eq(orders.id, ratings.orderId))
    .where(and(
      eq(orders.driverId, driverId),
      gte(orders.createdAt, startDate),
      lte(orders.createdAt, endDate),
      eq(orders.status, "delivered")
    ));

  return result.length > 0 ? result[0] : null;
}

export async function getAllPlatformSettings() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(platformSettings);
}

export async function getAvailableOrders() {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: orders.id,
    orderNumber: orders.orderNumber,
    status: orders.status,
    deliveryAddress: orders.deliveryAddress,
    deliveryFee: orders.deliveryFee,
    restaurantName: restaurants.name,
  })
    .from(orders)
    .innerJoin(restaurants, eq(orders.restaurantId, restaurants.id))
    .where(and(
      eq(orders.status, "ready"),
      sql`${orders.driverId} IS NULL`
    ))
    .orderBy(desc(orders.createdAt));
}

// Cart queries
export async function getOrCreateCart(customerId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existingCart = await db.select().from(carts).where(eq(carts.customerId, customerId)).limit(1);
  if (existingCart.length > 0) {
    return existingCart[0];
  }
  
  const result = await db.insert(carts).values({ customerId });
  const newCart = await db.select().from(carts).where(eq(carts.customerId, customerId)).limit(1);
  return newCart[0];
}

export async function getCartByCustomer(customerId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(carts).where(eq(carts.customerId, customerId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getCartItems(cartId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: cartItems.id,
    cartId: cartItems.cartId,
    menuItemId: cartItems.menuItemId,
    quantity: cartItems.quantity,
    price: cartItems.price,
    name: menuItems.name,
    description: menuItems.description,
    imageUrl: menuItems.imageUrl,
  })
    .from(cartItems)
    .innerJoin(menuItems, eq(cartItems.menuItemId, menuItems.id))
    .where(eq(cartItems.cartId, cartId));
}

export async function addCartItem(cartId: number, menuItemId: number, quantity: number, price: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if item already exists in cart
  const existing = await db.select().from(cartItems)
    .where(and(eq(cartItems.cartId, cartId), eq(cartItems.menuItemId, menuItemId)))
    .limit(1);
  
  if (existing.length > 0) {
    // Update quantity
    const newQuantity = existing[0].quantity + quantity;
    await db.update(cartItems)
      .set({ quantity: newQuantity })
      .where(eq(cartItems.id, existing[0].id));
    return existing[0];
  }
  
  return db.insert(cartItems).values({
    cartId,
    menuItemId,
    quantity,
    price,
  });
}

export async function updateCartItemQuantity(itemId: number, quantity: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (quantity <= 0) {
    return db.delete(cartItems).where(eq(cartItems.id, itemId));
  }
  
  return db.update(cartItems).set({ quantity }).where(eq(cartItems.id, itemId));
}

export async function removeCartItem(itemId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(cartItems).where(eq(cartItems.id, itemId));
}

export async function clearCart(cartId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(cartItems).where(eq(cartItems.cartId, cartId));
}

// Order Status History queries
export async function addOrderStatusHistory(data: InsertOrderStatusHistory) {
  const pool = await getPool();
  if (!pool) throw new Error("Database not available");

  const columns = ["orderId", "status", "notes", "createdBy"];
  const values = [
    data.orderId,
    data.status,
    data.notes || null,
    data.createdBy || null,
  ];

  const query = `INSERT INTO orderStatusHistory (${columns.join(", ")}) VALUES (?, ?, ?, ?)`;
  return pool.query(query, values);
}

export async function getOrderStatusHistory(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orderStatusHistory)
    .where(eq(orderStatusHistory.orderId, orderId))
    .orderBy(orderStatusHistory.timestamp);
}

// Driver Assignment queries
export async function createDriverAssignment(data: InsertDriverAssignment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(driverAssignments).values(data);
}

export async function getDriverAssignment(orderId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(driverAssignments)
    .where(eq(driverAssignments.orderId, orderId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateDriverAssignment(orderId: number, data: Partial<InsertDriverAssignment>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(driverAssignments).set(data).where(eq(driverAssignments.orderId, orderId));
}

export async function getDriverAssignmentsByDriver(driverId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: driverAssignments.id,
    orderId: driverAssignments.orderId,
    driverId: driverAssignments.driverId,
    status: driverAssignments.status,
    assignedAt: driverAssignments.assignedAt,
    acceptedAt: driverAssignments.acceptedAt,
    pickedUpAt: driverAssignments.pickedUpAt,
    deliveredAt: driverAssignments.deliveredAt,
    orderNumber: orders.orderNumber,
    deliveryAddress: orders.deliveryAddress,
    total: orders.total,
  })
    .from(driverAssignments)
    .innerJoin(orders, eq(driverAssignments.orderId, orders.id))
    .where(eq(driverAssignments.driverId, driverId))
    .orderBy(desc(driverAssignments.assignedAt));
}

// Notification queries
export async function createNotification(data: InsertNotification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(notifications).values(data);
}

export async function getUserNotifications(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function getUnreadNotificationCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`COUNT(*)` }).from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, 0)));
  return result[0]?.count || 0;
}

export async function markNotificationAsRead(notificationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(notifications).set({ isRead: 1 }).where(eq(notifications.id, notificationId));
}

export async function markAllNotificationsAsRead(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(notifications).set({ isRead: 1 }).where(eq(notifications.userId, userId));
}

// User management queries for admin
export async function getAllUsers(role?: string) {
  const db = await getDb();
  if (!db) return [];
  if (role) {
    return db.select().from(users).where(eq(users.role, role as any)).orderBy(desc(users.createdAt));
  }
  return db.select().from(users).orderBy(desc(users.createdAt));
}

export async function updateUserRole(userId: number, role: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(users).set({ role: role as any }).where(eq(users.id, userId));
}

export async function getAllDrivers(includeUnapproved = false) {
  const db = await getDb();
  if (!db) return [];
  if (includeUnapproved) {
    return db.select({
      id: drivers.id,
      userId: drivers.userId,
      phoneNumber: drivers.phoneNumber,
      vehicleType: drivers.vehicleType,
      status: drivers.status,
      isApproved: drivers.isApproved,
      totalDeliveries: drivers.totalDeliveries,
      averageRating: drivers.averageRating,
      totalEarnings: drivers.totalEarnings,
      name: users.name,
      email: users.email,
    })
      .from(drivers)
      .innerJoin(users, eq(drivers.userId, users.id))
      .orderBy(desc(drivers.createdAt));
  }
  return db.select({
    id: drivers.id,
    userId: drivers.userId,
    phoneNumber: drivers.phoneNumber,
    vehicleType: drivers.vehicleType,
    status: drivers.status,
    isApproved: drivers.isApproved,
    totalDeliveries: drivers.totalDeliveries,
    averageRating: drivers.averageRating,
    totalEarnings: drivers.totalEarnings,
    name: users.name,
    email: users.email,
  })
    .from(drivers)
    .innerJoin(users, eq(drivers.userId, users.id))
    .where(eq(drivers.isApproved, 1))
    .orderBy(desc(drivers.createdAt));
}

export async function approveDriver(driverId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(drivers).set({ isApproved: 1 }).where(eq(drivers.id, driverId));
}

export async function updateDriverStatus(driverId: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(drivers).set({ status: status as any }).where(eq(drivers.id, driverId));
}

export async function updateDriverLocation(driverId: number, latitude: string, longitude: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(drivers).set({
    currentLatitude: latitude,
    currentLongitude: longitude,
    lastLocationUpdate: new Date(),
  }).where(eq(drivers.id, driverId));
}

export async function getAllRestaurants(includeUnapproved = false) {
  const db = await getDb();
  if (!db) return [];
  if (includeUnapproved) {
    return db.select({
      id: restaurants.id,
      ownerId: restaurants.ownerId,
      name: restaurants.name,
      description: restaurants.description,
      address: restaurants.address,
      phoneNumber: restaurants.phoneNumber,
      isActive: restaurants.isActive,
      isApproved: restaurants.isApproved,
      ownerName: users.name,
      ownerEmail: users.email,
    })
      .from(restaurants)
      .innerJoin(users, eq(restaurants.ownerId, users.id))
      .orderBy(desc(restaurants.createdAt));
  }
  return db.select({
    id: restaurants.id,
    ownerId: restaurants.ownerId,
    name: restaurants.name,
    description: restaurants.description,
    address: restaurants.address,
    phoneNumber: restaurants.phoneNumber,
    isActive: restaurants.isActive,
    isApproved: restaurants.isApproved,
    ownerName: users.name,
    ownerEmail: users.email,
  })
    .from(restaurants)
    .innerJoin(users, eq(restaurants.ownerId, users.id))
    .where(eq(restaurants.isApproved, 1))
    .orderBy(desc(restaurants.createdAt));
}

export async function approveRestaurant(restaurantId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(restaurants).set({ isApproved: 1 }).where(eq(restaurants.id, restaurantId));
}

export async function toggleRestaurantActive(restaurantId: number, isActive: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(restaurants).set({ isActive: isActive ? 1 : 0 }).where(eq(restaurants.id, restaurantId));
}

export async function getAllOrders(limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: orders.id,
    orderNumber: orders.orderNumber,
    customerId: orders.customerId,
    restaurantId: orders.restaurantId,
    driverId: orders.driverId,
    status: orders.status,
    total: orders.total,
    paymentMethod: orders.paymentMethod,
    paymentStatus: orders.paymentStatus,
    createdAt: orders.createdAt,
    customerName: users.name,
    restaurantName: restaurants.name,
  })
    .from(orders)
    .innerJoin(users, eq(orders.customerId, users.id))
    .innerJoin(restaurants, eq(orders.restaurantId, restaurants.id))
    .orderBy(desc(orders.createdAt))
    .limit(limit);
}

export async function getPlatformStats() {
  const db = await getDb();
  if (!db) return null;
  
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const [
    totalUsers,
    totalRestaurants,
    totalDrivers,
    todayOrders,
    monthOrders,
    todayRevenue,
    monthRevenue,
  ] = await Promise.all([
    db.select({ count: sql<number>`COUNT(*)` }).from(users),
    db.select({ count: sql<number>`COUNT(*)` }).from(restaurants).where(eq(restaurants.isApproved, 1)),
    db.select({ count: sql<number>`COUNT(*)` }).from(drivers).where(eq(drivers.isApproved, 1)),
    db.select({ count: sql<number>`COUNT(*)` }).from(orders).where(gte(orders.createdAt, startOfToday)),
    db.select({ count: sql<number>`COUNT(*)` }).from(orders).where(gte(orders.createdAt, startOfMonth)),
    db.select({ total: sql<number>`COALESCE(SUM(${orders.total}), 0)` }).from(orders)
      .where(and(gte(orders.createdAt, startOfToday), eq(orders.status, "delivered"))),
    db.select({ total: sql<number>`COALESCE(SUM(${orders.total}), 0)` }).from(orders)
      .where(and(gte(orders.createdAt, startOfMonth), eq(orders.status, "delivered"))),
  ]);
  
  return {
    totalUsers: totalUsers[0]?.count || 0,
    totalRestaurants: totalRestaurants[0]?.count || 0,
    totalDrivers: totalDrivers[0]?.count || 0,
    todayOrders: todayOrders[0]?.count || 0,
    monthOrders: monthOrders[0]?.count || 0,
    todayRevenue: todayRevenue[0]?.total || 0,
    monthRevenue: monthRevenue[0]?.total || 0,
  };
}

export async function deleteMenuItem(itemId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(menuItems).where(eq(menuItems.id, itemId));
}

export async function deleteMenuCategory(categoryId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Also delete menu items in this category
  await db.delete(menuItems).where(eq(menuItems.categoryId, categoryId));
  return db.delete(menuCategories).where(eq(menuCategories.id, categoryId));
}
