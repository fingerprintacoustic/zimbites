import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

// Mock database module
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
}));

type CookieCall = {
  name: string;
  options: Record<string, unknown>;
};

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext; clearedCookies: CookieCall[] } {
  const clearedCookies: CookieCall[] = [];

  const user: AuthenticatedUser = {
    id: 1,
    openId: "sample-user",
    email: "sample@example.com",
    name: "Sample User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };

  return { ctx, clearedCookies };
}

describe("auth.logout", () => {
  it("clears the session cookie and reports success", async () => {
    const { ctx, clearedCookies } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.logout();

    expect(result).toEqual({ success: true });
    expect(clearedCookies).toHaveLength(1);
    expect(clearedCookies[0]?.name).toBe(COOKIE_NAME);
    expect(clearedCookies[0]?.options).toMatchObject({
      maxAge: -1,
      secure: true,
      sameSite: "lax",
      httpOnly: true,
      path: "/",
    });
  });
});
