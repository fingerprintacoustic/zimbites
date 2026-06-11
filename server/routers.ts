import { z } from "zod";
import { router, publicProcedure, protectedProcedure, restaurantOwnerProcedure, adminProcedure, driverProcedure, systemRouter } from "./_core/systemRouter";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";

const ORDER_STATUSES = ["pending", "confirmed", "preparing", "ready", "picked_up", "in_transit", "delivered", "cancelled", "rejected", "refunded"] as const;

export const appRouter = router({
  system: systemRouter,
  auth: router({
    debug: publicProcedure.query(async ({ ctx }) => {
      const { COOKIE_NAME } = await import("@shared/const");
      const cookie = ctx.req.headers.cookie;
      const { sdk } = await import("./_core/sdk");
      const cookies = (sdk as any).parseCookies(cookie);
      const sessionCookie = cookies.get(COOKIE_NAME);
      
      return {
        hasCookieHeader: !!cookie,
        cookieName: COOKIE_NAME,
        hasSessionCookie: !!sessionCookie,
        user: ctx.user ? { id: ctx.user.id, openId: ctx.user.openId, role: ctx.user.role } : null,
        env: {
          hasAppId: !!process.env.VITE_APP_ID,
          hasJwtSecret: !!process.env.JWT_SECRET,
        }
      };
    }),
    me: publicProcedure.query(async ({ ctx }) => {
      return ctx.user || null;
    }),
    logout: protectedProcedure.mutation(async ({ ctx }) => {
      const { COOKIE_NAME } = await import("@shared/const");
      const { getSessionCookieOptions } = await import("./_core/cookies");
      
      if (ctx.res) {
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      }
      return { success: true };
    }),
  }),

  cart: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
      const cart = await db.getOrCreateCart(ctx.user.id);
      const items = await db.getCartItems(cart.id);
      return { cart, items };
    }),
    
    addItem: protectedProcedure
      .input(z.object({
        menuItemId: z.number(),
        quantity: z.number().min(1).default(1),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        const menuItem = await db.getMenuItemById(input.menuItemId);
        if (!menuItem) throw new TRPCError({ code: "NOT_FOUND", message: "Menu item not found" });
        
        const cart = await db.getOrCreateCart(ctx.user.id);
        await db.addCartItem(cart.id, input.menuItemId, input.quantity, menuItem.price);
        
        const items = await db.getCartItems(cart.id);
        return { success: true, items };
      }),
    
    updateItem: protectedProcedure
      .input(z.object({
        itemId: z.number(),
        quantity: z.number().min(0),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        const cart = await db.getCartByCustomer(ctx.user.id);
        if (!cart) throw new TRPCError({ code: "NOT_FOUND", message: "Cart not found" });
        
        await db.updateCartItemQuantity(input.itemId, input.quantity);
        
        const items = await db.getCartItems(cart.id);
        return { success: true, items };
      }),
    
    removeItem: protectedProcedure
      .input(z.object({ itemId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        await db.removeCartItem(input.itemId);
        
        const cart = await db.getCartByCustomer(ctx.user.id);
        if (!cart) return { success: true, items: [] };
        
        const items = await db.getCartItems(cart.id);
        return { success: true, items };
      }),
    
    clear: protectedProcedure.mutation(async ({ ctx }) => {
      if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
      
      const cart = await db.getCartByCustomer(ctx.user.id);
      if (cart) {
        await db.clearCart(cart.id);
      }
      return { success: true };
    }),
  }),

  restaurant: router({
    getPlatformSettings: publicProcedure.query(async () => {
      return db.getAllPlatformSettings();
    }),
    getAll: publicProcedure.query(async () => {
      return db.getApprovedRestaurants();
    }),
    getApproved: publicProcedure.query(async () => {
      return db.getApprovedRestaurants();
    }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const restaurant = await db.getRestaurantById(input.id);
        if (!restaurant) throw new TRPCError({ code: "NOT_FOUND" });
        return restaurant;
      }),
    getByOwner: restaurantOwnerProcedure.query(async ({ ctx }) => {
      if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
      return db.getRestaurantsByOwner(ctx.user.id);
    }),
    create: restaurantOwnerProcedure
      .input(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        address: z.string().min(1),
        phoneNumber: z.string().optional(),
        latitude: z.string().optional(),
        longitude: z.string().optional(),
        minOrderAmount: z.number().optional(),
        deliveryRadius: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        const result = await db.createRestaurant({
          ownerId: ctx.user.id,
          name: input.name,
          description: input.description,
          address: input.address,
          phoneNumber: input.phoneNumber,
          latitude: input.latitude,
          longitude: input.longitude,
          minOrderAmount: input.minOrderAmount || 0,
          deliveryRadius: input.deliveryRadius || 15,
          isApproved: 0,
          isActive: 0,
        });
        
        return { success: true, restaurantId: result.insertId };
      }),
    update: restaurantOwnerProcedure
      .input(z.object({
        restaurantId: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        address: z.string().optional(),
        phoneNumber: z.string().optional(),
        latitude: z.string().optional(),
        longitude: z.string().optional(),
        minOrderAmount: z.number().optional(),
        deliveryRadius: z.number().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        const restaurant = await db.getRestaurantById(input.restaurantId);
        if (!restaurant || restaurant.ownerId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        
        await db.updateRestaurant(input.restaurantId, {
          name: input.name,
          description: input.description,
          address: input.address,
          phoneNumber: input.phoneNumber,
          latitude: input.latitude,
          longitude: input.longitude,
          minOrderAmount: input.minOrderAmount,
          deliveryRadius: input.deliveryRadius,
          isActive: input.isActive ? 1 : 0,
        });
        
        return { success: true };
      }),
    getMenuItems: publicProcedure
      .input(z.object({ restaurantId: z.number() }))
      .query(async ({ input }) => {
        return db.getMenuItemsByRestaurant(input.restaurantId);
      }),
  }),

  menu: router({
    getCategories: publicProcedure
      .input(z.object({ restaurantId: z.number() }))
      .query(async ({ input }) => {
        return db.getMenuCategoriesByRestaurant(input.restaurantId);
      }),
    getItems: publicProcedure
      .input(z.object({ categoryId: z.number() }))
      .query(async ({ input }) => {
        return db.getMenuItemsByCategory(input.categoryId);
      }),
    getByRestaurant: publicProcedure
      .input(z.object({ restaurantId: z.number() }))
      .query(async ({ input }) => {
        const categories = await db.getMenuCategoriesByRestaurant(input.restaurantId);
        const items = await db.getMenuItemsByRestaurant(input.restaurantId);
        return { categories, items };
      }),
    createCategory: restaurantOwnerProcedure
      .input(z.object({
        restaurantId: z.number(),
        name: z.string().min(1),
        description: z.string().optional(),
        displayOrder: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        const restaurant = await db.getRestaurantById(input.restaurantId);
        if (!restaurant || restaurant.ownerId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        
        const result = await db.createMenuCategory({
          restaurantId: input.restaurantId,
          name: input.name,
          description: input.description,
          displayOrder: input.displayOrder || 0,
        });
        
        return { success: true, categoryId: result.insertId };
      }),
    updateCategory: restaurantOwnerProcedure
      .input(z.object({
        categoryId: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        displayOrder: z.number().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        await db.updateMenuCategory(input.categoryId, {
          name: input.name,
          description: input.description,
          displayOrder: input.displayOrder,
          isActive: input.isActive ? 1 : 0,
        });
        
        return { success: true };
      }),
    deleteCategory: restaurantOwnerProcedure
      .input(z.object({ categoryId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        await db.deleteMenuCategory(input.categoryId);
        return { success: true };
      }),
    createItem: restaurantOwnerProcedure
      .input(z.object({
        restaurantId: z.number(),
        categoryId: z.number(),
        name: z.string().min(1),
        description: z.string().optional(),
        price: z.number(),
        currency: z.enum(["USD", "ZWL"]).default("ZWL"),
        imageUrl: z.string().optional(),
        preparationTime: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        const restaurant = await db.getRestaurantById(input.restaurantId);
        if (!restaurant || restaurant.ownerId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        
        const result = await db.createMenuItem({
          restaurantId: input.restaurantId,
          categoryId: input.categoryId,
          name: input.name,
          description: input.description,
          price: input.price,
          currency: input.currency,
          imageUrl: input.imageUrl,
          preparationTime: input.preparationTime || 15,
        });
        
        return { success: true, itemId: result.insertId };
      }),
    updateItem: restaurantOwnerProcedure
      .input(z.object({
        itemId: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        price: z.number().optional(),
        currency: z.enum(["USD", "ZWL"]).optional(),
        imageUrl: z.string().optional(),
        preparationTime: z.number().optional(),
        isAvailable: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        await db.updateMenuItem(input.itemId, {
          name: input.name,
          description: input.description,
          price: input.price,
          currency: input.currency,
          imageUrl: input.imageUrl,
          preparationTime: input.preparationTime,
          isAvailable: input.isAvailable ? 1 : 0,
        });
        
        return { success: true };
      }),
    deleteItem: restaurantOwnerProcedure
      .input(z.object({ itemId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        await db.deleteMenuItem(input.itemId);
        return { success: true };
      }),
  }),

  order: router({
    create: protectedProcedure
      .input(z.object({
        restaurantId: z.number(),
        deliveryAddress: z.string().min(1),
        deliveryLatitude: z.string().optional(),
        deliveryLongitude: z.string().optional(),
        deliveryNotes: z.string().optional(),
        paymentMethod: z.string().min(1),
        paymentReference: z.string().optional(),
        tip: z.number().default(0),
        // Support cart items from client (sessionStorage-based cart)
        cartItems: z.array(z.object({
          menuItemId: z.number(),
          name: z.string(),
          price: z.number(),
          quantity: z.number(),
          currency: z.enum(["USD", "ZWL"]).default("ZWL"),
        })).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        console.log("[OrderCreate] Starting mutation", { userId: ctx.user?.id, input });
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });

        // Get cart items - either from client input or from database
        let cartItemsList: Array<{ menuItemId: number; name: string; price: number; quantity: number }> = [];
        
        if (input.cartItems && input.cartItems.length > 0) {
          // Use cart items from client (sessionStorage-based cart)
          cartItemsList = input.cartItems;
          console.log("[OrderCreate] Using cart items from client input:", cartItemsList.length);
        } else {
          // Fallback: get from database (legacy approach)
          const cart = await db.getCartByCustomer(ctx.user.id);
          if (!cart) throw new TRPCError({ code: "BAD_REQUEST", message: "Cart not found" });
          
          const dbCartItems = await db.getCartItems(cart.id);
          if (dbCartItems.length === 0) throw new TRPCError({ code: "BAD_REQUEST", message: "Cart is empty" });
          
          cartItemsList = dbCartItems.map(item => ({
            menuItemId: item.menuItemId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          }));
        }

        // Get restaurant
        const restaurant = await db.getRestaurantById(input.restaurantId);
        console.log("[OrderCreate] Restaurant found:", !!restaurant);
        if (!restaurant) throw new TRPCError({ code: "NOT_FOUND", message: "Restaurant not found" });

        // Determine currency from the first cart item or default
        const orderCurrency = cartItemsList[0]?.currency || "ZWL";

        // Calculate totals
        let subtotal = 0;
        const orderItems = [];

        for (const item of cartItemsList) {
          const itemTotal = item.price * item.quantity;
          subtotal += itemTotal;
          orderItems.push({
            menuItemId: item.menuItemId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            subtotal: itemTotal,
          });
        }

        // Get platform settings for fees
        const commissionSetting = await db.getPlatformSetting("commission_percentage");
        let commissionPercent = 10;
        if (commissionSetting) {
          try {
            const parsed = JSON.parse(commissionSetting.settingValue);
            commissionPercent = typeof parsed === 'object' ? parsed.value : Number(commissionSetting.settingValue);
          } catch {
            commissionPercent = Number(commissionSetting.settingValue) || 10;
          }
        }
        
        const deliveryFeeSetting = await db.getPlatformSetting("delivery_fee_base");
        let deliveryFee = 500;
        if (deliveryFeeSetting) {
          try {
            const parsed = JSON.parse(deliveryFeeSetting.settingValue);
            deliveryFee = typeof parsed === 'object' ? parsed.value : Number(deliveryFeeSetting.settingValue);
          } catch {
            deliveryFee = Number(deliveryFeeSetting.settingValue) || 500;
          }
        }

        const platformCommission = Math.round(subtotal * (commissionPercent / 100));
        const tax = 0;
        const discount = 0;
        const total = subtotal + deliveryFee + tax - discount + platformCommission + (input.tip || 0);

        // Create order
        const orderNumber = `ORD-${Date.now()}-${nanoid(6)}`;
        console.log("[OrderCreate] Creating order", { orderNumber, total });
        
        let orderResult: any;
        try {
          orderResult = await db.createOrder({
            customerId: ctx.user.id,
            restaurantId: input.restaurantId,
            orderNumber,
            status: "pending",
            deliveryAddress: input.deliveryAddress,
            deliveryLatitude: input.deliveryLatitude,
            deliveryLongitude: input.deliveryLongitude,
            deliveryNotes: input.deliveryNotes,
            subtotal,
            deliveryFee,
            tax,
            discount,
            platformCommission: platformCommission,
            tip: input.tip || 0,
            total,
            currency: orderCurrency,
            paymentMethod: input.paymentMethod,
            paymentReference: input.paymentReference,
            paymentStatus: "pending",
          });

          console.log("[OrderCreate] Order created, result:", orderResult);
          
          if (!orderResult?.insertId) {
            console.error("[OrderCreate] Failed to get order ID from insert result:", orderResult);
            throw new Error("Failed to create order - no order ID returned");
          }
          
          const orderId = orderResult.insertId;

          // Add order status history
          await db.addOrderStatusHistory({
            orderId: orderId as number,
            status: "pending",
            notes: "Order placed",
            createdBy: ctx.user.id,
          });

          // Create order items
          const itemsToCreate = orderItems.map(item => ({
            orderId: orderId as number,
            ...item,
          }));
          console.log("[OrderCreate] Creating order items", itemsToCreate);
          await db.createOrderItems(itemsToCreate);
          
          // Clear the cart (only if using database cart, not sessionStorage)
          if (!input.cartItems || input.cartItems.length === 0) {
            const dbCart = await db.getCartByCustomer(ctx.user.id);
            if (dbCart) {
              await db.clearCart(dbCart.id);
            }
          }
          
          // Create notification for restaurant
          const restaurantOwner = await db.getUserById(restaurant.ownerId);
          if (restaurantOwner) {
            await db.createNotification({
              userId: restaurantOwner.id,
              title: "New Order",
              message: `You have a new order #${orderNumber}`,
              type: "order",
              metadata: JSON.stringify({ orderId }),
            });
          }
          
          return {
            success: true,
            orderId: orderId as number,
            orderNumber,
            total,
          };
        } catch (error) {
          console.error("[OrderCreate] Database error:", error);
          // Log the underlying cause for debugging
          if (error instanceof Error && (error as any).cause) {
            console.error("[OrderCreate] Cause:", (error as any).cause);
          }
          throw new TRPCError({ 
            code: "INTERNAL_SERVER_ERROR", 
            message: error instanceof Error ? error.message : "Database error" 
          });
        }
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const order = await db.getOrderById(input.id);
        if (!order) throw new TRPCError({ code: "NOT_FOUND" });

        // Check access
        const isCustomer = order.customerId === ctx.user?.id;
        const restaurant = await db.getRestaurantById(order.restaurantId);
        const isRestaurantOwner = restaurant?.ownerId === ctx.user?.id;
        const driver = await db.getDriverByUserId(ctx.user!.id);
        const isDriver = driver && order.driverId === driver.id;
        const isAdmin = ctx.user?.role === "admin";

        if (!isCustomer && !isRestaurantOwner && !isDriver && !isAdmin) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        const items = await db.getOrderItems(order.id);
        const statusHistory = await db.getOrderStatusHistory(order.id);
        return { ...order, items, statusHistory };
      }),

    getByCustomer: protectedProcedure
      .query(async ({ ctx }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        return db.getOrdersByCustomer(ctx.user.id);
      }),

    getByRestaurant: restaurantOwnerProcedure
      .input(z.object({ restaurantId: z.number() }))
      .query(async ({ ctx, input }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        const restaurant = await db.getRestaurantById(input.restaurantId);
        if (!restaurant || restaurant.ownerId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        return db.getOrdersByRestaurant(input.restaurantId);
      }),

    // Restaurant order status updates
    accept: restaurantOwnerProcedure
      .input(z.object({ orderId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });

        const order = await db.getOrderById(input.orderId);
        if (!order) throw new TRPCError({ code: "NOT_FOUND" });

        const restaurant = await db.getRestaurantById(order.restaurantId);
        if (!restaurant || restaurant.ownerId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        if (order.status !== "pending") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Order cannot be accepted" });
        }

        await db.updateOrder(input.orderId, { status: "confirmed" as any });
        await db.addOrderStatusHistory({
          orderId: input.orderId,
          status: "accepted",
          notes: "Order accepted by restaurant",
          createdBy: ctx.user.id,
        });

        // Notify customer
        await db.createNotification({
          userId: order.customerId,
          title: "Order Accepted",
          message: `Your order #${order.orderNumber} has been accepted`,
          type: "order",
          metadata: JSON.stringify({ orderId: input.orderId }),
        });

        return { success: true };
      }),

    reject: restaurantOwnerProcedure
      .input(z.object({ orderId: z.number(), reason: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });

        const order = await db.getOrderById(input.orderId);
        if (!order) throw new TRPCError({ code: "NOT_FOUND" });

        const restaurant = await db.getRestaurantById(order.restaurantId);
        if (!restaurant || restaurant.ownerId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        await db.updateOrder(input.orderId, { status: "rejected" });
        await db.addOrderStatusHistory({
          orderId: input.orderId,
          status: "rejected",
          notes: input.reason || "Order rejected by restaurant",
          createdBy: ctx.user.id,
        });

        // Notify customer
        await db.createNotification({
          userId: order.customerId,
          title: "Order Rejected",
          message: `Your order #${order.orderNumber} has been rejected`,
          type: "order",
          metadata: JSON.stringify({ orderId: input.orderId }),
        });

        return { success: true };
      }),

    startPreparing: restaurantOwnerProcedure
      .input(z.object({ orderId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });

        const order = await db.getOrderById(input.orderId);
        if (!order) throw new TRPCError({ code: "NOT_FOUND" });

        const restaurant = await db.getRestaurantById(order.restaurantId);
        if (!restaurant || restaurant.ownerId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        await db.updateOrder(input.orderId, { status: "preparing" });
        await db.addOrderStatusHistory({
          orderId: input.orderId,
          status: "preparing",
          notes: "Restaurant started preparing",
          createdBy: ctx.user.id,
        });

        await db.createNotification({
          userId: order.customerId,
          title: "Preparing Your Order",
          message: `Your order #${order.orderNumber} is being prepared`,
          type: "order",
          metadata: JSON.stringify({ orderId: input.orderId }),
        });

        return { success: true };
      }),

    markReady: restaurantOwnerProcedure
      .input(z.object({ orderId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });

        const order = await db.getOrderById(input.orderId);
        if (!order) throw new TRPCError({ code: "NOT_FOUND" });

        const restaurant = await db.getRestaurantById(order.restaurantId);
        if (!restaurant || restaurant.ownerId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        await db.updateOrder(input.orderId, { status: "ready" as any });
        await db.addOrderStatusHistory({
          orderId: input.orderId,
          status: "ready",
          notes: "Order ready for pickup",
          createdBy: ctx.user.id,
        });

        // Notify available drivers
        const drivers = await db.getAvailableDrivers();
        for (const driver of drivers) {
          await db.createNotification({
            userId: driver.userId,
            title: "New Delivery Available",
            message: `A delivery is ready at ${restaurant.name}`,
            type: "delivery",
            metadata: JSON.stringify({ orderId: input.orderId, restaurantId: restaurant.id }),
          });
        }

        return { success: true };
      }),

    // Driver order actions
    assignDriver: driverProcedure
      .input(z.object({ orderId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });

        const order = await db.getOrderById(input.orderId);
        if (!order) throw new TRPCError({ code: "NOT_FOUND" });

        const driver = await db.getDriverByUserId(ctx.user.id);
        if (!driver) throw new TRPCError({ code: "NOT_FOUND", message: "Driver profile not found" });

        // Create driver assignment
        await db.createDriverAssignment({
          orderId: input.orderId,
          driverId: driver.id,
          status: "accepted",
          acceptedAt: new Date(),
        });

        await db.updateOrder(input.orderId, { 
          driverId: driver.id,
          status: "confirmed" as any 
        });
        await db.updateDriver(driver.id, { status: "on_delivery" });
        await db.addOrderStatusHistory({
          orderId: input.orderId,
          status: "confirmed",
          notes: "Driver assigned",
          createdBy: ctx.user.id,
        });

        // Notify customer
        await db.createNotification({
          userId: order.customerId,
          title: "Driver Assigned",
          message: `A driver has been assigned to your order #${order.orderNumber}`,
          type: "order",
          metadata: JSON.stringify({ orderId: input.orderId }),
        });

        return { success: true };
      }),

    confirmPickup: driverProcedure
      .input(z.object({ orderId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });

        const order = await db.getOrderById(input.orderId);
        if (!order) throw new TRPCError({ code: "NOT_FOUND" });

        await db.updateOrder(input.orderId, { 
          status: "picked_up" as any,
          pickedUpAt: new Date(),
        });
        await db.updateDriverAssignment(input.orderId, { status: "picked_up", pickedUpAt: new Date() });
        await db.addOrderStatusHistory({
          orderId: input.orderId,
          status: "picked_up",
          notes: "Driver picked up order",
          createdBy: ctx.user.id,
        });

        await db.createNotification({
          userId: order.customerId,
          title: "Order Picked Up",
          message: `Your order #${order.orderNumber} has been picked up!`,
          type: "order",
          metadata: JSON.stringify({ orderId: input.orderId }),
        });

        return { success: true };
      }),

    startDelivery: driverProcedure
      .input(z.object({ orderId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });

        const order = await db.getOrderById(input.orderId);
        if (!order) throw new TRPCError({ code: "NOT_FOUND" });

        await db.updateOrder(input.orderId, { 
          status: "in_transit" as any,
        });
        await db.addOrderStatusHistory({
          orderId: input.orderId,
          status: "in_transit",
          notes: "Driver is on the way",
          createdBy: ctx.user.id,
        });

        await db.createNotification({
          userId: order.customerId,
          title: "Order on the Way",
          message: `Your order #${order.orderNumber} is on its way!`,
          type: "order",
          metadata: JSON.stringify({ orderId: input.orderId }),
        });

        return { success: true };
      }),

    confirmDelivery: protectedProcedure
      .input(z.object({ orderId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });

        const order = await db.getOrderById(input.orderId);
        if (!order) throw new TRPCError({ code: "NOT_FOUND" });

        await db.updateOrder(input.orderId, { 
          status: "delivered",
          deliveredAt: new Date(),
          paymentStatus: "completed",
        });
        await db.updateDriverAssignment(input.orderId, { 
          deliveredAt: new Date(),
          status: "completed",
        });
        await db.addOrderStatusHistory({
          orderId: input.orderId,
          status: "delivered",
          notes: "Order delivered",
          createdBy: ctx.user.id,
        });

        // Update driver stats
        if (order.driverId) {
          const driver = await db.getDriverById(order.driverId);
          if (driver) {
            await db.updateDriver(driver.id, { 
              status: "available",
              totalDeliveries: driver.totalDeliveries + 1,
              totalEarnings: driver.totalEarnings + order.deliveryFee,
            });
          }
        }

        await db.createNotification({
          userId: order.customerId,
          title: "Order Delivered",
          message: `Your order #${order.orderNumber} has been delivered!`,
          type: "order",
          metadata: JSON.stringify({ orderId: input.orderId }),
        });

        return { success: true };
      }),

    confirmByCustomer: protectedProcedure
      .input(z.object({ orderId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });

        const order = await db.getOrderById(input.orderId);
        if (!order) throw new TRPCError({ code: "NOT_FOUND" });

        if (order.customerId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        await db.updateOrder(input.orderId, { status: "customer_confirmed" });
        await db.addOrderStatusHistory({
          orderId: input.orderId,
          status: "customer_confirmed",
          notes: "Delivery confirmed by customer",
          createdBy: ctx.user.id,
        });

        return { success: true };
      }),

    cancel: protectedProcedure
      .input(z.object({ orderId: z.number(), reason: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });

        const order = await db.getOrderById(input.orderId);
        if (!order) throw new TRPCError({ code: "NOT_FOUND" });

        // Only customer can cancel pending orders
        if (order.customerId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        if (!["pending", "accepted"].includes(order.status)) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Order cannot be cancelled" });
        }

        await db.updateOrder(input.orderId, { status: "cancelled" });
        await db.addOrderStatusHistory({
          orderId: input.orderId,
          status: "cancelled",
          notes: input.reason || "Cancelled by customer",
          createdBy: ctx.user.id,
        });

        return { success: true };
      }),

    getStatusHistory: protectedProcedure
      .input(z.object({ orderId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getOrderStatusHistory(input.orderId);
      }),
  }),

  driver: router({
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
      const driver = await db.getDriverByUserId(ctx.user.id);
      if (!driver) throw new TRPCError({ code: "NOT_FOUND" });
      return driver;
    }),
    
    getWallet: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
      const driver = await db.getDriverByUserId(ctx.user.id);
      if (!driver) throw new TRPCError({ code: "NOT_FOUND" });
      return db.getDriverWallet(driver.id);
    }),
    
    register: protectedProcedure
      .input(z.object({
        phoneNumber: z.string().min(1),
        vehicleType: z.enum(["motorcycle", "car", "bicycle"]),
        licensePlate: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        const existing = await db.getDriverByUserId(ctx.user.id);
        if (existing) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Driver profile already exists" });
        }
        
        const result = await db.createDriver({
          userId: ctx.user.id,
          phoneNumber: input.phoneNumber,
          vehicleType: input.vehicleType,
          licensePlate: input.licensePlate,
          status: "offline",
        });
        
        // Create wallet
        await db.createDriverWallet({
          driverId: result.insertId as number,
        });
        
        return { success: true, driverId: result.insertId };
      }),
    
    updateStatus: driverProcedure
      .input(z.object({ status: z.enum(["available", "offline"]) }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        const driver = await db.getDriverByUserId(ctx.user.id);
        if (!driver) throw new TRPCError({ code: "NOT_FOUND" });
        
        await db.updateDriver(driver.id, { status: input.status });
        return { success: true };
      }),
    
    updateLocation: driverProcedure
      .input(z.object({
        latitude: z.string(),
        longitude: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        const driver = await db.getDriverByUserId(ctx.user.id);
        if (!driver) throw new TRPCError({ code: "NOT_FOUND" });
        
        await db.updateDriverLocation(driver.id, input.latitude, input.longitude);
        return { success: true };
      }),
    
    getAssignedDeliveries: driverProcedure.query(async ({ ctx }) => {
      if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
      const driver = await db.getDriverByUserId(ctx.user.id);
      if (!driver) throw new TRPCError({ code: "NOT_FOUND" });
      return db.getDriverAssignmentsByDriver(driver.id);
    }),
    
    getAvailableOrders: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
      return db.getAvailableOrders();
    }),
    
    acceptDelivery: driverProcedure
      .input(z.object({ orderId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        const driver = await db.getDriverByUserId(ctx.user.id);
        if (!driver) throw new TRPCError({ code: "NOT_FOUND" });

        const order = await db.getOrderById(input.orderId);
        if (!order) throw new TRPCError({ code: "NOT_FOUND" });
        if (order.driverId) throw new TRPCError({ code: "BAD_REQUEST", message: "Order already has a driver" });
        if (order.status !== "ready_for_pickup") throw new TRPCError({ code: "BAD_REQUEST", message: "Order not ready for pickup" });

        await db.createDriverAssignment({
          orderId: input.orderId,
          driverId: driver.id,
          status: "accepted",
          acceptedAt: new Date(),
        });

        await db.updateOrder(input.orderId, { 
          driverId: driver.id,
          status: "confirmed" as any 
        });
        await db.updateDriver(driver.id, { status: "on_delivery" });
        
        await db.addOrderStatusHistory({
          orderId: input.orderId,
          status: "confirmed",
          notes: "Driver accepted delivery",
          createdBy: ctx.user.id,
        });

        return { success: true };
      }),
    
    getDeliveryHistory: driverProcedure.query(async ({ ctx }) => {
      if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
      const driver = await db.getDriverByUserId(ctx.user.id);
      if (!driver) throw new TRPCError({ code: "NOT_FOUND" });
      return db.getOrdersByDriver(driver.id);
    }),
  }),

  rating: router({
    create: protectedProcedure
      .input(z.object({
        orderId: z.number(),
        rating: z.number().min(1).max(5),
        comment: z.string().optional(),
        restaurantId: z.number().optional(),
        driverId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        await db.createRating({
          orderId: input.orderId,
          customerId: ctx.user.id,
          rating: input.rating,
          comment: input.comment,
          restaurantId: input.restaurantId,
          driverId: input.driverId,
        });
        
        return { success: true };
      }),
  }),

  notification: router({
    getAll: protectedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        return db.getUserNotifications(ctx.user.id, input?.limit || 50);
      }),
    
    getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
      return db.getUnreadNotificationCount(ctx.user.id);
    }),
    
    markAsRead: protectedProcedure
      .input(z.object({ notificationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        await db.markNotificationAsRead(input.notificationId);
        return { success: true };
      }),
    
    markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
      if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
      await db.markAllNotificationsAsRead(ctx.user.id);
      return { success: true };
    }),
  }),

  admin: router({
    getStats: adminProcedure
      .input(z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }).optional())
      .query(async ({ input }) => {
        const now = new Date();
        const start = input?.startDate || new Date(now.getFullYear(), now.getMonth(), 1);
        const end = input?.endDate || now;
        const [stats, orderStats] = await Promise.all([
          db.getPlatformStats(),
          db.getOrderStats(start, end),
        ]);
        return { ...stats, orderStats };
      }),
    
    getUsers: adminProcedure
      .input(z.object({ role: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return db.getAllUsers(input?.role);
      }),
    
    updateUserRole: adminProcedure
      .input(z.object({ userId: z.number(), role: z.string() }))
      .mutation(async ({ ctx, input }) => {
        await db.updateUserRole(input.userId, input.role);
        return { success: true };
      }),
    
    getRestaurants: adminProcedure
      .input(z.object({ includeUnapproved: z.boolean().optional() }).optional())
      .query(async ({ input }) => {
        return db.getAllRestaurants(input?.includeUnapproved);
      }),
    
    approveRestaurant: adminProcedure
      .input(z.object({ restaurantId: z.number() }))
      .mutation(async ({ input }) => {
        await db.approveRestaurant(input.restaurantId);
        return { success: true };
      }),
    
    rejectRestaurant: adminProcedure
      .input(z.object({ restaurantId: z.number() }))
      .mutation(async ({ input }) => {
        await db.updateRestaurant(input.restaurantId, { isApproved: 0 });
        return { success: true };
      }),
    
    toggleRestaurantActive: adminProcedure
      .input(z.object({ restaurantId: z.number(), isActive: z.boolean() }))
      .mutation(async ({ input }) => {
        await db.toggleRestaurantActive(input.restaurantId, input.isActive);
        return { success: true };
      }),
    
    getDrivers: adminProcedure
      .input(z.object({ includeUnapproved: z.boolean().optional() }).optional())
      .query(async ({ input }) => {
        return db.getAllDrivers(input?.includeUnapproved);
      }),
    
    approveDriver: adminProcedure
      .input(z.object({ driverId: z.number() }))
      .mutation(async ({ input }) => {
        await db.approveDriver(input.driverId);
        return { success: true };
      }),
    
    rejectDriver: adminProcedure
      .input(z.object({ driverId: z.number() }))
      .mutation(async ({ input }) => {
        await db.updateDriver(input.driverId, { isApproved: 0 });
        return { success: true };
      }),
    
    getOrders: adminProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return db.getAllOrders(input?.limit || 100);
      }),
    
    getPendingRestaurants: adminProcedure.query(async () => {
      const restaurants = await db.getAllRestaurants(true);
      return restaurants.filter((r: any) => !r.isApproved);
    }),
    
    getPendingDrivers: adminProcedure.query(async () => {
      const drivers = await db.getAllDrivers(true);
      return drivers.filter((d: any) => !d.isApproved);
    }),
    
    getPlatformSettings: protectedProcedure.query(async () => {
      return db.getAllPlatformSettings();
    }),
    
    updatePlatformSetting: adminProcedure
      .input(z.object({
        key: z.string(),
        value: z.string(),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.setPlatformSetting(input.key, input.value, input.description);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
