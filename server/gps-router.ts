import { router, driverProcedure, protectedProcedure } from "./_core/systemRouter";
import { z } from "zod";
import * as db from "./db";
import * as gps from "./gps";
import { TRPCError } from "@trpc/server";

export const gpsRouter = router({
  /**
   * Update driver's current location
   * Called frequently during delivery
   */
  updateLocation: driverProcedure
    .input(z.object({
      assignmentId: z.number(),
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
      accuracy: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Validate coordinates
      if (!gps.validateCoordinates(input.latitude, input.longitude)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid coordinates" });
      }

      // Verify driver owns this assignment
      const assignment = await db.getDriverAssignmentById(input.assignmentId);
      if (!assignment) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Assignment not found" });
      }

      const driver = await db.getDriverByUserId(ctx.user?.id || 0);
      if (!driver || driver.id !== assignment.driverId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized for this assignment" });
      }

      // Update driver location in assignment
      await db.updateAssignmentLocation(input.assignmentId, input.latitude.toString(), input.longitude.toString());

      // Update driver's last known location
      await db.updateDriverLocation(driver.id, input.latitude.toString(), input.longitude.toString());

      return { success: true };
    }),

  /**
   * Get current delivery route information
   * Includes distances and ETA to restaurant and customer
   */
  getDeliveryRoute: driverProcedure
    .input(z.object({ assignmentId: z.number() }))
    .query(async ({ input, ctx }) => {
      const assignment = await db.getDriverAssignmentById(input.assignmentId);
      if (!assignment) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const driver = await db.getDriverByUserId(ctx.user?.id || 0);
      if (!driver || driver.id !== assignment.driverId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const order = await db.getOrderById(assignment.orderId);
      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
      }

      const restaurant = await db.getRestaurantById(order.restaurantId);
      if (!restaurant) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Restaurant not found" });
      }

      // Current driver location
      const driverLocation = {
        latitude: parseFloat(assignment.currentLatitude || "0"),
        longitude: parseFloat(assignment.currentLongitude || "0"),
        timestamp: assignment.lastLocationUpdate || new Date(),
      };

      // Restaurant location
      const restaurantLocation = {
        latitude: parseFloat(restaurant.latitude || "0"),
        longitude: parseFloat(restaurant.longitude || "0"),
        timestamp: new Date(),
      };

      // Customer location
      const customerLocation = {
        latitude: parseFloat(order.deliveryLatitude || "0"),
        longitude: parseFloat(order.deliveryLongitude || "0"),
        timestamp: new Date(),
      };

      // Calculate distances
      const distanceToRestaurant = gps.calculateDistance(
        driverLocation.latitude,
        driverLocation.longitude,
        restaurantLocation.latitude,
        restaurantLocation.longitude
      );

      const distanceToCustomer = gps.calculateDistance(
        driverLocation.latitude,
        driverLocation.longitude,
        customerLocation.latitude,
        customerLocation.longitude
      );

      // Calculate ETAs
      const etaToRestaurant = gps.estimateTimeToDestination(distanceToRestaurant);
      const etaToCustomer = gps.estimateTimeToDestination(distanceToCustomer);

      return {
        driverLocation,
        restaurantLocation,
        customerLocation,
        distanceToRestaurant,
        distanceToCustomer,
        etaToRestaurant,
        etaToCustomer,
        atRestaurant: gps.isWithinGeofence(driverLocation, restaurantLocation, 100),
        atCustomer: gps.isWithinGeofence(driverLocation, customerLocation, 100),
      };
    }),

  /**
   * Check if driver has arrived at restaurant
   */
  checkRestaurantArrival: driverProcedure
    .input(z.object({ assignmentId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const assignment = await db.getDriverAssignmentById(input.assignmentId);
      if (!assignment) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const driver = await db.getDriverByUserId(ctx.user?.id || 0);
      if (!driver || driver.id !== assignment.driverId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const order = await db.getOrderById(assignment.orderId);
      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const restaurant = await db.getRestaurantById(order.restaurantId);
      if (!restaurant) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const driverLocation = {
        latitude: parseFloat(assignment.currentLatitude || "0"),
        longitude: parseFloat(assignment.currentLongitude || "0"),
        timestamp: assignment.lastLocationUpdate || new Date(),
      };

      const restaurantLocation = {
        latitude: parseFloat(restaurant.latitude || "0"),
        longitude: parseFloat(restaurant.longitude || "0"),
        timestamp: new Date(),
      };

      const hasArrived = gps.isWithinGeofence(driverLocation, restaurantLocation, 100);

      if (hasArrived && !assignment.pickedUpAt) {
        await db.updateDriverAssignment(input.assignmentId, {
          status: "picked_up",
          pickedUpAt: new Date(),
        });
      }

      return { hasArrived };
    }),

  /**
   * Check if driver has arrived at customer location
   */
  checkCustomerArrival: driverProcedure
    .input(z.object({ assignmentId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const assignment = await db.getDriverAssignmentById(input.assignmentId);
      if (!assignment) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const driver = await db.getDriverByUserId(ctx.user?.id || 0);
      if (!driver || driver.id !== assignment.driverId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const order = await db.getOrderById(assignment.orderId);
      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const driverLocation = {
        latitude: parseFloat(assignment.currentLatitude || "0"),
        longitude: parseFloat(assignment.currentLongitude || "0"),
        timestamp: assignment.lastLocationUpdate || new Date(),
      };

      const customerLocation = {
        latitude: parseFloat(order.deliveryLatitude || "0"),
        longitude: parseFloat(order.deliveryLongitude || "0"),
        timestamp: new Date(),
      };

      const hasArrived = gps.isWithinGeofence(driverLocation, customerLocation, 100);

      if (hasArrived && !assignment.deliveredAt) {
        await db.updateDriverAssignment(input.assignmentId, {
          status: "completed",
          deliveredAt: new Date(),
        });
        
        // Update order status
        await db.updateOrderStatus(assignment.orderId, "delivered");
      }

      return { hasArrived };
    }),

  /**
   * Get driver's current location (for customers tracking delivery)
   */
  getDriverLocation: protectedProcedure
    .input(z.object({ orderId: z.number() }))
    .query(async ({ input, ctx }) => {
      const order = await db.getOrderById(input.orderId);
      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Allow customer or restaurant to view driver location
      const isCustomer = order.customerId === ctx.user?.id;
      const restaurant = await db.getRestaurantById(order.restaurantId);
      const isRestaurant = restaurant?.ownerId === ctx.user?.id;

      if (!isCustomer && !isRestaurant) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      // Get active assignment
      const assignment = await db.getDriverAssignmentByOrder(input.orderId);
      if (!assignment) {
        return null;
      }

      return {
        latitude: parseFloat(assignment.currentLatitude || "0"),
        longitude: parseFloat(assignment.currentLongitude || "0"),
        timestamp: assignment.lastLocationUpdate,
        accuracy: 50, // meters
      };
    }),
});
