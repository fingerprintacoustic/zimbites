import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import * as db from "../db";

// In-memory user store for demo (no database required)
const demoUsers = new Map<string, any>();

export function registerDevLoginRoute(app: Express) {
  // Seed menu data endpoint - uses actual restaurant IDs from database
  app.get("/api/dev/seed-menu", async (req: Request, res: Response) => {
    try {
      // Get all approved restaurants
      const restaurants = await db.getApprovedRestaurants();
      
      if (restaurants.length === 0) {
        res.status(400).json({ error: "No restaurants found. Please run the database seed first." });
        return;
      }

      // Map restaurant names to IDs for menu seeding
      const restaurantMap: Record<string, number> = {};
      restaurants.forEach(r => {
        restaurantMap[r.name.toLowerCase()] = r.id;
      });

      // Define menu data per restaurant name pattern
      const menuData = [
        // Harare Grill House (ID 1)
        { restaurantName: "harare grill house", categoryName: "Main Course", items: [
          { name: "Sadza and Beef", description: "Traditional sadza with tender beef", price: 800, prepTime: 20 },
          { name: "Roasted Chicken", description: "Half roasted chicken with sides", price: 1200, prepTime: 25 },
        ]},
        { restaurantName: "harare grill house", categoryName: "Grilled Meats", items: [
          { name: "Grilled T-bone Steak", description: "Premium 500g T-bone steak", price: 2500, prepTime: 30 },
          { name: "Grilled Pork Chops", description: "Two grilled pork chops", price: 1800, prepTime: 25 },
        ]},
        { restaurantName: "harare grill house", categoryName: "Sides", items: [
          { name: "Coleslaw", description: "Fresh creamy coleslaw", price: 200, prepTime: 5 },
          { name: "Chips", description: "Golden crispy chips", price: 250, prepTime: 10 },
        ]},
        { restaurantName: "harare grill house", categoryName: "Drinks", items: [
          { name: "Soft Drink", description: "330ml can", price: 150, prepTime: 2 },
          { name: "Bottled Water", description: "500ml", price: 100, prepTime: 2 },
        ]},
        
        // Spice Garden (ID 2)
        { restaurantName: "spice garden", categoryName: "Appetizers", items: [
          { name: "Samosas", description: "4 vegetable samosas", price: 400, prepTime: 10 },
          { name: "Pakoras", description: "Mixed vegetable pakoras", price: 350, prepTime: 10 },
        ]},
        { restaurantName: "spice garden", categoryName: "Main Course", items: [
          { name: "Butter Chicken", description: "Creamy butter chicken curry", price: 1200, prepTime: 25 },
          { name: "Biryani", description: "Chicken biryani with raita", price: 1100, prepTime: 20 },
        ]},
        { restaurantName: "spice garden", categoryName: "Curries", items: [
          { name: "Lamb Curry", description: "Slow cooked lamb curry", price: 1500, prepTime: 30 },
          { name: "Vegetable Curry", description: "Mixed vegetable curry", price: 800, prepTime: 20 },
        ]},
        { restaurantName: "spice garden", categoryName: "Desserts", items: [
          { name: "Gulab Jamun", description: "2 sweet gulab jamun", price: 300, prepTime: 5 },
          { name: "Ice Cream", description: "Vanilla ice cream", price: 400, prepTime: 5 },
        ]},
        
        // Mama Africa Kitchen (ID 3)
        { restaurantName: "mama africa kitchen", categoryName: "Traditional Dishes", items: [
          { name: "Nyama Choma", description: "Grilled beef with Sadza", price: 1500, prepTime: 30 },
          { name: "Madora", description: "Traditional pork stew", price: 1000, prepTime: 25 },
        ]},
        { restaurantName: "mama africa kitchen", categoryName: "Meats", items: [
          { name: "Grilled Chicken", description: "Half grilled chicken", price: 900, prepTime: 25 },
          { name: "Grilled Fish", description: "Fresh grilled tilapia", price: 1100, prepTime: 30 },
        ]},
        { restaurantName: "mama africa kitchen", categoryName: "Vegetables", items: [
          { name: "Collard Greens", description: "Traditional greens", price: 400, prepTime: 15 },
          { name: "Roasted Squash", description: "Seasonal roasted squash", price: 350, prepTime: 15 },
        ]},
        
        // Pizza Paradise (ID 4)
        { restaurantName: "pizza paradise", categoryName: "Pizzas", items: [
          { name: "Margherita Pizza", description: "Classic tomato and mozzarella", price: 800, prepTime: 15 },
          { name: "Pepperoni Pizza", description: "Pepperoni with cheese", price: 1000, prepTime: 15 },
        ]},
        { restaurantName: "pizza paradise", categoryName: "Sides", items: [
          { name: "Garlic Bread", description: "Crusty bread with garlic butter", price: 300, prepTime: 10 },
          { name: "Chicken Wings", description: "6 spicy wings", price: 500, prepTime: 15 },
        ]},
        
        // Dragon Wok (ID 5)
        { restaurantName: "dragon wok", categoryName: "Noodles", items: [
          { name: "Chow Mein", description: "Stir-fried noodles with vegetables", price: 600, prepTime: 15 },
          { name: "Lo Mein", description: "Soft noodles with sauce", price: 650, prepTime: 15 },
        ]},
        { restaurantName: "dragon wok", categoryName: "Rice Dishes", items: [
          { name: "Fried Rice", description: "Egg fried rice with vegetables", price: 500, prepTime: 12 },
          { name: "Yangzhou Rice", description: "Premium fried rice with BBQ pork", price: 750, prepTime: 15 },
        ]},

        // The Great Kitchen
        { restaurantName: "the great kitchen", categoryName: "Main Dishes", items: [
          { name: "Grilled Chicken", description: "Half grilled chicken with chips", price: 850, prepTime: 20 },
          { name: "Beef Stew", description: "Traditional beef stew with sadza", price: 750, prepTime: 25 },
        ]},
        { restaurantName: "the great kitchen", categoryName: "Sides", items: [
          { name: "Chips", description: "Large portion of crispy chips", price: 200, prepTime: 10 },
          { name: "Rice", description: "Steamed white rice", price: 150, prepTime: 5 },
        ]},
        { restaurantName: "the great kitchen", categoryName: "Drinks", items: [
          { name: "Soft Drink", description: "330ml can of your choice", price: 150, prepTime: 2 },
          { name: "Juice", description: "Fresh fruit juice", price: 200, prepTime: 2 },
        ]},
      ];

      // Track created categories to avoid duplicates
      const createdCategories: Map<string, number> = new Map();
      let itemCount = 0;

      for (const menu of menuData) {
        const restaurantId = restaurantMap[menu.restaurantName];
        if (!restaurantId) continue;

        // Get or create category
        const categoryKey = `${restaurantId}-${menu.categoryName}`;
        let categoryId = createdCategories.get(categoryKey);

        if (!categoryId) {
          // Check if category exists
          const existingCategories = await db.getMenuCategoriesByRestaurant(restaurantId);
          const existingCat = existingCategories.find(c => c.name === menu.categoryName);
          
          if (existingCat) {
            categoryId = existingCat.id;
            console.log(`[SeedMenu] Using existing category ${categoryId} for ${menu.categoryName}`);
          } else {
            const result = await db.createMenuCategory({
              restaurantId,
              name: menu.categoryName,
              displayOrder: existingCategories.length + 1,
              isActive: 1,
            });
            categoryId = result.insertId;
            console.log(`[SeedMenu] Created category ${categoryId}: ${menu.categoryName}`);
          }
          createdCategories.set(categoryKey, categoryId);
        }

        // Create menu items
        for (const item of menu.items) {
          try {
            const result = await db.createMenuItem({
              restaurantId,
              categoryId,
              name: item.name,
              description: item.description,
              price: item.price,
              preparationTime: item.prepTime,
              isAvailable: 1,
            });
            console.log(`[SeedMenu] Created item: ${item.name} (category ${categoryId}), result:`, result);
            itemCount++;
          } catch (e: any) {
            console.error(`[SeedMenu] Item error ${item.name}:`, e?.message || e);
          }
        }
      }

      res.json({ 
        success: true, 
        message: `Menu seeded: ${itemCount} items in ${createdCategories.size} categories`,
        restaurants: restaurants.map(r => ({ id: r.id, name: r.name }))
      });
    } catch (error: any) {
      console.error("[SeedMenu] Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/dev/login", async (req: Request, res: Response) => {
    const openId = req.query.openId as string;
    const accessCode = req.query.accessCode as string;
    const name = (req.query.name as string) || openId;

    // Beta access code check - disabled for testing
    // const betaCode = process.env.BETA_ACCESS_CODE;
    // if (betaCode && accessCode !== betaCode) {
    //   res.status(403).send("Invalid beta access code");
    //   return;
    // }

    if (!openId) {
      res.status(400).send("openId query parameter is required");
      return;
    }

    try {
      // Determine role based on openId prefix
      let role = "customer";
      let displayName = "Demo Customer";
      
      if (openId.includes("admin")) {
        role = "admin";
        displayName = "Demo Admin";
      } else if (openId.includes("restaurant")) {
        role = "restaurant";
        displayName = "Demo Restaurant";
      } else if (openId.includes("driver")) {
        role = "driver";
        displayName = "Demo Driver";
      }

      // Upsert user into database for consistent experience
      await import("../db").then(db => db.upsertUser({
        openId,
        name: displayName,
        email: `${openId}@zimbites.local`,
        role: role as any,
        loginMethod: "dev",
        lastSignedIn: new Date(),
      }));

      // Create session token
      const sessionToken = await sdk.createSessionToken(openId, {
        name: displayName,
        role,
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      // Redirect to appropriate dashboard based on role
      let redirectUrl = "/";
      if (role === "customer") redirectUrl = "/home";
      else if (role === "restaurant") redirectUrl = "/restaurant-dashboard";
      else if (role === "driver") redirectUrl = "/driver-dashboard";
      else if (role === "admin") redirectUrl = "/admin-dashboard";

      res.redirect(302, redirectUrl);
    } catch (error) {
      console.error("[DevLogin] Failed", error);
      res.status(500).send("Login failed: " + String(error));
    }
  });
}
