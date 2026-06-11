import dotenv from "dotenv";
dotenv.config();

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { menuCategories, menuItems } from "./drizzle/schema";
import { eq } from "drizzle-orm";

async function reseedMenu() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error("DATABASE_URL not set");
  }

  console.log("Connecting to database...");
  const connection = await mysql.createConnection(dbUrl);
  const db = drizzle(connection);

  console.log("Checking existing categories...");

  // Check existing categories
  const existing = await db
    .select()
    .from(menuCategories)
    .where(eq(menuCategories.restaurantId, 360001));

  console.log(`Found ${existing.length} existing categories`);

  if (existing.length === 0) {
    console.log("Seeding menu categories and items...");

    // Create categories
    const categoryData = [
      { restaurantId: 360001, name: "Grilled Meats", description: "Premium grilled meats" },
      { restaurantId: 360001, name: "Sides", description: "Delicious side dishes" },
      { restaurantId: 360001, name: "Drinks", description: "Refreshing beverages" },
    ];

    for (const cat of categoryData) {
      await db.insert(menuCategories).values(cat);
      console.log(`✅ Created category: ${cat.name}`);
    }

    // Get the created categories
    const createdCategories = await db
      .select()
      .from(menuCategories)
      .where(eq(menuCategories.restaurantId, 360001));

    console.log("Created categories:", createdCategories.map(c => ({ id: c.id, name: c.name })));

    // Create menu items
    const itemsData = [
      { categoryId: createdCategories[0].id, name: "Grilled Beef Steak", description: "Premium beef steak", price: 3500, preparationTime: 20, isAvailable: true },
      { categoryId: createdCategories[0].id, name: "Grilled Chicken Quarter", description: "Tender chicken", price: 2500, preparationTime: 15, isAvailable: true },
      { categoryId: createdCategories[0].id, name: "Pork Chops", description: "Juicy pork chops", price: 2800, preparationTime: 18, isAvailable: true },
      { categoryId: createdCategories[1].id, name: "Sadza", description: "Traditional maize meal", price: 500, preparationTime: 10, isAvailable: true },
      { categoryId: createdCategories[1].id, name: "Vegetables", description: "Fresh vegetables", price: 400, preparationTime: 8, isAvailable: true },
      { categoryId: createdCategories[2].id, name: "Coke", description: "Cold Coca Cola", price: 300, preparationTime: 1, isAvailable: true },
      { categoryId: createdCategories[2].id, name: "Fanta", description: "Refreshing Fanta", price: 300, preparationTime: 1, isAvailable: true },
    ];

    for (const item of itemsData) {
      await db.insert(menuItems).values(item);
      console.log(`✅ Created menu item: ${item.name}`);
    }

    console.log("✅ Seeding complete!");
  }

  // Verify
  const final = await db
    .select()
    .from(menuCategories)
    .where(eq(menuCategories.restaurantId, 360001));

  console.log("\n✅ Final verification - Categories:");
  final.forEach(cat => {
    console.log(`  - ${cat.name} (ID: ${cat.id})`);
  });

  await connection.end();
}

reseedMenu().catch(console.error);
