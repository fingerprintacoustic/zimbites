import { describe, expect, it, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock database
vi.mock("./db", () => ({
  getDb: vi.fn(),
  upsertUser: vi.fn(),
  getUserByOpenId: vi.fn(),
  getUserById: vi.fn(),
  getRestaurantById: vi.fn(),
  getMenuItemById: vi.fn(),
  getCartByCustomer: vi.fn(),
  getCartItems: vi.fn(),
  createOrder: vi.fn(),
  getOrderById: vi.fn(),
  addOrderStatusHistory: vi.fn(),
  createNotification: vi.fn(),
  getPlatformSetting: vi.fn(),
  getDriverByUserId: vi.fn(),
  getDriverById: vi.fn(),
  updateDriver: vi.fn(),
  updateOrder: vi.fn(),
  createDriverAssignment: vi.fn(),
  updateDriverAssignment: vi.fn(),
  getAvailableDrivers: vi.fn(),
  getOrCreateCart: vi.fn(),
  addCartItem: vi.fn(),
  clearCart: vi.fn(),
  getAllUsers: vi.fn(),
  getUserNotifications: vi.fn(),
  getUnreadNotificationCount: vi.fn(),
  getPlatformStats: vi.fn(),
  getOrderStats: vi.fn(),
  getApprovedRestaurants: vi.fn(),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createMockContext(user?: AuthenticatedUser): { ctx: TrpcContext } {
  return {
    ctx: {
      user: user || null,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {
        clearCookie: vi.fn(),
      } as unknown as TrpcContext["res"],
    },
  };
}

describe("auth router", () => {
  it("me returns null when not authenticated", async () => {
    const { ctx } = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("me returns user when authenticated", async () => {
    const mockUser: AuthenticatedUser = {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "demo",
      role: "customer",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    };
    const { ctx } = createMockContext(mockUser);
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toEqual(mockUser);
  });

  it("logout clears session cookie", async () => {
    const mockUser: AuthenticatedUser = {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "demo",
      role: "customer",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    };
    const { ctx } = createMockContext(mockUser);
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
  });
});

describe("cart router", () => {
  const mockUser: AuthenticatedUser = {
    id: 1,
    openId: "customer-001",
    email: "john@example.com",
    name: "John Smith",
    loginMethod: "demo",
    role: "customer",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  it("get returns cart with items", async () => {
    const mockCart = { id: 1, customerId: 1, createdAt: new Date(), updatedAt: new Date() };
    const mockItems = [
      { id: 1, cartId: 1, menuItemId: 1, quantity: 2, price: 1000, name: "Test Item", description: "Test", imageUrl: null },
    ];

    const { ctx } = createMockContext(mockUser);
    const caller = appRouter.createCaller(ctx);

    const db = await import("./db");
    vi.mocked(db.getOrCreateCart).mockResolvedValue(mockCart);
    vi.mocked(db.getCartItems).mockResolvedValue(mockItems);

    const result = await caller.cart.get();
    expect(result).toEqual({ cart: mockCart, items: mockItems });
  });
});

describe("restaurant router", () => {
  it("getAll returns approved restaurants", async () => {
    const { ctx } = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const mockRestaurants = [
      { id: 1, name: "Test Restaurant", address: "123 Test St", isApproved: 1, isActive: 1 },
    ];

    const db = await import("./db");
    vi.mocked(db.getApprovedRestaurants).mockResolvedValue(mockRestaurants);

    const result = await caller.restaurant.getAll();
    expect(result).toEqual(mockRestaurants);
  });

  it("getById throws NOT_FOUND for non-existent restaurant", async () => {
    const { ctx } = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const db = await import("./db");
    vi.mocked(db.getRestaurantById).mockResolvedValue(undefined);

    await expect(caller.restaurant.getById({ id: 999 })).rejects.toThrow("NOT_FOUND");
  });
});

describe("order router", () => {
  const mockUser: AuthenticatedUser = {
    id: 1,
    openId: "customer-001",
    email: "john@example.com",
    name: "John Smith",
    loginMethod: "demo",
    role: "customer",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  it("create throws error when not logged in", async () => {
    const { ctx } = createMockContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.order.create({
        restaurantId: 1,
        deliveryAddress: "123 Test St",
        paymentMethod: "cash",
      })
    ).rejects.toThrow("Please login");
  });

  it("getById throws NOT_FOUND for non-existent order", async () => {
    const { ctx } = createMockContext(mockUser);
    const caller = appRouter.createCaller(ctx);

    const db = await import("./db");
    vi.mocked(db.getOrderById).mockResolvedValue(undefined);

    await expect(caller.order.getById({ id: 999 })).rejects.toThrow("NOT_FOUND");
  });

  it("getById throws FORBIDDEN when user doesn't have access", async () => {
    const { ctx } = createMockContext(mockUser);
    const caller = appRouter.createCaller(ctx);

    const db = await import("./db");
    vi.mocked(db.getOrderById).mockResolvedValue({
      id: 1,
      orderNumber: "ORD-123",
      customerId: 999, // Different customer
      restaurantId: 1,
      driverId: null,
      status: "pending",
      deliveryAddress: "123 Test St",
      subtotal: 1000,
      deliveryFee: 500,
      tax: 0,
      discount: 0,
      platformCommission: 100,
      tip: 0,
      total: 1600,
      paymentMethod: "cash",
      paymentStatus: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(db.getRestaurantById).mockResolvedValue({
      id: 1,
      ownerId: 888, // Different owner
      name: "Test Restaurant",
      address: "123 Test St",
    });

    await expect(caller.order.getById({ id: 1 })).rejects.toThrow("FORBIDDEN");
  });
});

describe("driver router", () => {
  const mockDriverUser: AuthenticatedUser = {
    id: 1,
    openId: "driver-001",
    email: "driver@example.com",
    name: "Test Driver",
    loginMethod: "demo",
    role: "driver",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  it("getProfile throws NOT_FOUND when driver doesn't exist", async () => {
    const { ctx } = createMockContext(mockDriverUser);
    const caller = appRouter.createCaller(ctx);

    const db = await import("./db");
    vi.mocked(db.getDriverByUserId).mockResolvedValue(undefined);

    await expect(caller.driver.getProfile()).rejects.toThrow("NOT_FOUND");
  });

  it("register throws error if driver already exists", async () => {
    const { ctx } = createMockContext(mockDriverUser);
    const caller = appRouter.createCaller(ctx);

    const db = await import("./db");
    vi.mocked(db.getDriverByUserId).mockResolvedValue({
      id: 1,
      userId: 1,
      phoneNumber: "+263771111111",
      vehicleType: "motorcycle",
      status: "available",
      isApproved: 1,
      totalDeliveries: 0,
      averageRating: "0.0",
      totalEarnings: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(
      caller.driver.register({
        phoneNumber: "+263771111111",
        vehicleType: "motorcycle",
      })
    ).rejects.toThrow("Driver profile already exists");
  });
});

describe("notification router", () => {
  const mockUser: AuthenticatedUser = {
    id: 1,
    openId: "customer-001",
    email: "john@example.com",
    name: "John Smith",
    loginMethod: "demo",
    role: "customer",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  it("getAll returns user notifications", async () => {
    const { ctx } = createMockContext(mockUser);
    const caller = appRouter.createCaller(ctx);

    const mockNotifications = [
      { id: 1, userId: 1, title: "Test", message: "Test message", type: "order" as const, isRead: 0, createdAt: new Date() },
    ];

    const db = await import("./db");
    vi.mocked(db.getUserNotifications).mockResolvedValue(mockNotifications);

    const result = await caller.notification.getAll();
    expect(result).toEqual(mockNotifications);
  });

  it("getUnreadCount returns count of unread notifications", async () => {
    const { ctx } = createMockContext(mockUser);
    const caller = appRouter.createCaller(ctx);

    const db = await import("./db");
    vi.mocked(db.getUnreadNotificationCount).mockResolvedValue(5);

    const result = await caller.notification.getUnreadCount();
    expect(result).toBe(5);
  });
});

describe("admin router", () => {
  const mockAdminUser: AuthenticatedUser = {
    id: 1,
    openId: "admin-001",
    email: "admin@zimbites.com",
    name: "Admin User",
    loginMethod: "demo",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  it("getStats returns platform statistics", async () => {
    const { ctx } = createMockContext(mockAdminUser);
    const caller = appRouter.createCaller(ctx);

    const db = await import("./db");
    vi.mocked(db.getPlatformStats).mockResolvedValue({
      totalUsers: 100,
      totalRestaurants: 20,
      totalDrivers: 50,
      todayOrders: 25,
      monthOrders: 500,
      todayRevenue: 50000,
      monthRevenue: 1000000,
    });
    vi.mocked(db.getOrderStats).mockResolvedValue({
      totalOrders: 500,
      totalRevenue: 1000000,
      totalCommission: 100000,
      totalDeliveryFees: 250000,
      totalTips: 50000,
    });

    const result = await caller.admin.getStats();
    expect(result.totalUsers).toBe(100);
    expect(result.totalRestaurants).toBe(20);
  });

  it("getUsers returns all users", async () => {
    const { ctx } = createMockContext(mockAdminUser);
    const caller = appRouter.createCaller(ctx);

    const mockUsers = [
      { id: 1, openId: "user-001", name: "User 1", email: "user1@example.com", role: "customer" },
    ];

    const db = await import("./db");
    vi.mocked(db.getAllUsers).mockResolvedValue(mockUsers);

    const result = await caller.admin.getUsers();
    expect(result).toEqual(mockUsers);
  });
});