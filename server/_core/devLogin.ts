import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import * as db from "../db";

// In-memory user store for demo (no database required)
const demoUsers = new Map<string, any>();

// Menu data structure
const MENU_DATA: Record<string, Record<string, Array<{name: string, description: string, price: number, prepTime: number}>>> = {
  "harare grill house": {
    "Main Course": [
      { name: "Sadza and Beef", description: "Traditional sadza with tender beef", price: 800, prepTime: 20 },
      { name: "Roasted Chicken", description: "Half roasted chicken with sides", price: 1200, prepTime: 25 },
    ],
    "Grilled Meats": [
      { name: "Grilled T-bone Steak", description: "Premium 500g T-bone steak", price: 2500, prepTime: 30 },
      { name: "Grilled Pork Chops", description: "Two grilled pork chops", price: 1800, prepTime: 25 },
    ],
    "Sides": [
      { name: "Coleslaw", description: "Fresh creamy coleslaw", price: 200, prepTime: 5 },
      { name: "Chips", description: "Golden crispy chips", price: 250, prepTime: 10 },
    ],
    "Drinks": [
      { name: "Soft Drink", description: "330ml can", price: 150, prepTime: 2 },
      { name: "Bottled Water", description: "500ml", price: 100, prepTime: 2 },
    ],
  },
  "spice garden": {
    "Appetizers": [
      { name: "Samosas", description: "4 vegetable samosas", price: 400, prepTime: 10 },
      { name: "Pakoras", description: "Mixed vegetable pakoras", price: 350, prepTime: 10 },
    ],
    "Main Course": [
      { name: "Butter Chicken", description: "Creamy butter chicken curry", price: 1200, prepTime: 25 },
      { name: "Biryani", description: "Chicken biryani with raita", price: 1100, prepTime: 20 },
    ],
    "Curries": [
      { name: "Lamb Curry", description: "Slow cooked lamb curry", price: 1500, prepTime: 30 },
      { name: "Vegetable Curry", description: "Mixed vegetable curry", price: 800, prepTime: 20 },
    ],
    "Desserts": [
      { name: "Gulab Jamun", description: "2 sweet gulab jamun", price: 300, prepTime: 5 },
      { name: "Ice Cream", description: "Vanilla ice cream", price: 400, prepTime: 5 },
    ],
  },
  "mama africa kitchen": {
    "Traditional Dishes": [
      { name: "Nyama Choma", description: "Grilled beef with Sadza", price: 1500, prepTime: 30 },
      { name: "Madora", description: "Traditional pork stew", price: 1000, prepTime: 25 },
    ],
    "Meats": [
      { name: "Grilled Chicken", description: "Half grilled chicken", price: 900, prepTime: 25 },
      { name: "Grilled Fish", description: "Fresh grilled tilapia", price: 1100, prepTime: 30 },
    ],
    "Vegetables": [
      { name: "Collard Greens", description: "Traditional greens", price: 400, prepTime: 15 },
      { name: "Roasted Squash", description: "Seasonal roasted squash", price: 350, prepTime: 15 },
    ],
  },
  "the great kitchen": {
    "Main Dishes": [
      { name: "Grilled Chicken", description: "Half grilled chicken with chips", price: 850, prepTime: 20 },
      { name: "Beef Stew", description: "Traditional beef stew with sadza", price: 750, prepTime: 25 },
    ],
    "Sides": [
      { name: "Chips", description: "Large portion of crispy chips", price: 200, prepTime: 10 },
      { name: "Rice", description: "Steamed white rice", price: 150, prepTime: 5 },
    ],
    "Drinks": [
      { name: "Soft Drink", description: "330ml can of your choice", price: 150, prepTime: 2 },
      { name: "Juice", description: "Fresh fruit juice", price: 200, prepTime: 2 },
    ],
  },
};

export function registerDevLoginRoute(app: Express) {
  // Helper to get raw MySQL connection for direct queries
  async function getConnection() {
    const url = new URL(process.env.DATABASE_URL || '');
    const mysql = await import('mysql2/promise');
    return mysql.createConnection({
      host: url.hostname,
      port: url.port ? parseInt(url.port) : 3306,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
      ssl: { rejectUnauthorized: false },
    });
  }

  // Seed menu data endpoint - uses actual restaurant IDs from database
  app.get("/api/dev/seed-menu", async (req: Request, res: Response) => {
    try {
      // Get raw connection for direct SQL queries
      const conn = await getConnection();
      
      // Get all approved restaurants
      const [restaurants] = await conn.query(
        'SELECT id, name FROM restaurants WHERE isApproved = 1 AND isActive = 1'
      ) as any;
      
      if (restaurants.length === 0) {
        res.status(400).json({ error: "No restaurants found. Please run the database seed first." });
        return;
      }

      // Map restaurant names to IDs for menu seeding
      const restaurantMap: Record<string, number> = {};
      restaurants.forEach((r: any) => {
        restaurantMap[r.name.toLowerCase()] = r.id;
      });

      const results = [];

      // Insert menu items for each restaurant
      for (const [restaurantName, categories] of Object.entries(MENU_DATA)) {
        const restaurantId = restaurantMap[restaurantName];
        if (!restaurantId) continue;

        for (const [categoryName, items] of Object.entries(categories as any)) {
          // Create or get category
          const [existingCats] = await conn.query(
            'SELECT id FROM menu_categories WHERE restaurantId = ? AND name = ?',
            [restaurantId, categoryName]
          ) as any;
          
          let categoryId: number;
          if (existingCats.length > 0) {
            categoryId = existingCats[0].id;
          } else {
            const [catResult] = await conn.query(
              'INSERT INTO menu_categories (restaurantId, name, displayOrder, isActive) VALUES (?, ?, 1, 1)',
              [restaurantId, categoryName]
            ) as any;
            categoryId = catResult.insertId;
            results.push(`Created category: ${categoryName} (id: ${categoryId})`);
          }

          // Insert items
          for (const item of items as any[]) {
            try {
              const [itemResult] = await conn.query(
                'INSERT INTO menu_items (restaurantId, categoryId, name, description, price, preparationTime, isAvailable) VALUES (?, ?, ?, ?, ?, ?, 1)',
                [restaurantId, categoryId, item.name, item.description, item.price, item.prepTime]
              ) as any;
              results.push(`Created ${item.name} (id: ${itemResult.insertId})`);
            } catch (e: any) {
              results.push(`Error ${item.name}: ${e.message}`);
            }
          }
        }
      }

      await conn.end();
      res.json({ success: true, results });
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
