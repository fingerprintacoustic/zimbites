/**
 * Seed menu categories and items for restaurant 360001 (Harare Grill House)
 * Run with: npx tsx seed-restaurant-360001.ts
 */

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./drizzle/schema.ts";
import dotenv from "dotenv";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable not set");
  process.exit(1);
}

async function seedRestaurant() {
  console.log("🌱 Seeding menu for restaurant 360001 (Harare Grill House)...\n");

  let connection;
  try {
    // Create connection
    const url = new URL(DATABASE_URL);
    connection = await mysql.createConnection({
      host: url.hostname,
      port: url.port ? parseInt(url.port) : 3306,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
      ssl: { rejectUnauthorized: false }
    });

    const db = drizzle(connection);

    const restaurantId = 360001;

    // Create menu categories
    console.log("📝 Creating menu categories...");
    const categories = [
      { restaurantId, name: "Grilled Meats", description: "Premium grilled beef, chicken, and pork", displayOrder: 1, isActive: 1 },
      { restaurantId, name: "Sides", description: "Vegetables, grains, and traditional sides", displayOrder: 2, isActive: 1 },
      { restaurantId, name: "Drinks", description: "Beverages and refreshments", displayOrder: 3, isActive: 1 },
    ];

    for (const cat of categories) {
      await db.insert(schema.menuCategories).values(cat).onDuplicateKeyUpdate({
        set: { displayOrder: cat.displayOrder },
      });
    }

    console.log("✅ Created menu categories\n");

    // Get category IDs
    const allCats = await db.select().from(schema.menuCategories);
    const getCatId = (name: string) => allCats.find(c => c.restaurantId === restaurantId && c.name === name)?.id;

    console.log("🍽️  Creating menu items...");

    const menuItems = [
      // Harare Grill House - Grilled Meats
      { restaurantId, categoryId: getCatId("Grilled Meats")!, name: "Grilled Beef Steak", description: "Premium 250g beef steak grilled to perfection", price: 3500, preparationTime: 20, isActive: 1 },
      { restaurantId, categoryId: getCatId("Grilled Meats")!, name: "Grilled Chicken Quarter", description: "Half chicken marinated and grilled", price: 2500, preparationTime: 15, isActive: 1 },
      { restaurantId, categoryId: getCatId("Grilled Meats")!, name: "Pork Chops", description: "Two thick-cut pork chops with herbs", price: 2800, preparationTime: 18, isActive: 1 },
      { restaurantId, categoryId: getCatId("Grilled Meats")!, name: "Mixed Grill Platter", description: "Combination of beef, chicken, and pork", price: 5500, preparationTime: 25, isActive: 1 },
      { restaurantId, categoryId: getCatId("Grilled Meats")!, name: "Lamb Chops", description: "Tender lamb chops with mint sauce", price: 4000, preparationTime: 22, isActive: 1 },
      { restaurantId, categoryId: getCatId("Grilled Meats")!, name: "Boerewors Roll", description: "Traditional South African sausage roll", price: 1200, preparationTime: 10, isActive: 1 },
      { restaurantId, categoryId: getCatId("Grilled Meats")!, name: "Grilled Fish Fillet", description: "Fresh tilapia grilled with lemon butter", price: 3200, preparationTime: 18, isActive: 1 },
      { restaurantId, categoryId: getCatId("Grilled Meats")!, name: "BBQ Ribs", description: "Slow-grilled pork ribs with BBQ sauce", price: 4200, preparationTime: 30, isActive: 1 },
      // Harare Grill House - Sides
      { restaurantId, categoryId: getCatId("Sides")!, name: "Chip Chips", description: "Crispy fried potatoes", price: 800, preparationTime: 8, isActive: 1 },
      { restaurantId, categoryId: getCatId("Sides")!, name: "Coleslaw", description: "Fresh creamy coleslaw", price: 500, preparationTime: 2, isActive: 1 },
      { restaurantId, categoryId: getCatId("Sides")!, name: "Grilled Vegetables", description: "Seasonal vegetables grilled", price: 700, preparationTime: 10, isActive: 1 },
      { restaurantId, categoryId: getCatId("Sides")!, name: "Sadza", description: "Traditional maize porridge", price: 400, preparationTime: 5, isActive: 1 },
      // Harare Grill House - Drinks
      { restaurantId, categoryId: getCatId("Drinks")!, name: "Soft Drink", description: "Assorted soft drinks 330ml", price: 300, preparationTime: 1, isActive: 1 },
      { restaurantId, categoryId: getCatId("Drinks")!, name: "Fresh Juice", description: "Freshly squeezed juice", price: 600, preparationTime: 3, isActive: 1 },
      { restaurantId, categoryId: getCatId("Drinks")!, name: "Water", description: "Bottled water 500ml", price: 200, preparationTime: 1, isActive: 1 },
    ];

    for (const item of menuItems) {
      await db.insert(schema.menuItems).values(item).onDuplicateKeyUpdate({
        set: { price: item.price },
      });
    }

    console.log("✅ Created menu items\n");

    console.log("🎉 Seeding complete!");
    await connection.end();
  } catch (error) {
    console.error("❌ Error:", error);
    if (connection) await connection.end();
    process.exit(1);
  }
}

seedRestaurant();
