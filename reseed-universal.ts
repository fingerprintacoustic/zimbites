import dotenv from "dotenv";
dotenv.config();

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { menuCategories, menuItems, restaurants } from "./drizzle/schema";
import { eq, and } from "drizzle-orm";

async function reseedRestaurant(restaurantId: number) {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error("DATABASE_URL not set");
  }

  console.log(`\n--- Reseeding Restaurant ID: ${restaurantId} ---`);
  const connection = await mysql.createConnection(dbUrl);
  const db = drizzle(connection);

  // Check if restaurant exists
  const [restaurant] = await db
    .select()
    .from(restaurants)
    .where(eq(restaurants.id, restaurantId));

  if (!restaurant) {
    console.log(`❌ Restaurant ${restaurantId} not found in database.`);
    await connection.end();
    return;
  }

  console.log(`Found Restaurant: ${restaurant.name}`);

  // Check existing categories
  const existingCats = await db
    .select()
    .from(menuCategories)
    .where(eq(menuCategories.restaurantId, restaurantId));

  if (existingCats.length > 0) {
    console.log(`✅ Restaurant already has ${existingCats.length} categories. Skipping reseed.`);
    await connection.end();
    return;
  }

  console.log("Seeding menu categories and items...");

  // Sample data based on restaurant type or default
  const isSpiceGarden = restaurant.name.toLowerCase().includes("spice");
  
  const categoryData = isSpiceGarden ? [
    { restaurantId, name: "Curries", description: "Authentic spicy curries" },
    { restaurantId, name: "Tandoori", description: "Clay oven specialties" },
    { restaurantId, name: "Breads & Rice", description: "Accompaniments" },
  ] : [
    { restaurantId, name: "Grilled Meats", description: "Premium grilled meats" },
    { restaurantId, name: "Sides", description: "Delicious side dishes" },
    { restaurantId, name: "Drinks", description: "Refreshing beverages" },
  ];

  for (const cat of categoryData) {
    await db.insert(menuCategories).values(cat);
    console.log(`  ✅ Created category: ${cat.name}`);
  }

  const createdCategories = await db
    .select()
    .from(menuCategories)
    .where(eq(menuCategories.restaurantId, restaurantId));

  const itemsData = isSpiceGarden ? [
    { categoryId: createdCategories[0].id, restaurantId, name: "Butter Chicken", description: "Creamy tomato based curry", price: 1800, preparationTime: 25, isAvailable: true },
    { categoryId: createdCategories[0].id, restaurantId, name: "Lamb Rogan Josh", description: "Traditional kashmiri lamb curry", price: 2200, preparationTime: 30, isAvailable: true },
    { categoryId: createdCategories[1].id, restaurantId, name: "Chicken Tikka", description: "Spiced grilled chicken chunks", price: 1500, preparationTime: 20, isAvailable: true },
    { categoryId: createdCategories[2].id, restaurantId, name: "Garlic Naan", description: "Freshly baked garlic bread", price: 400, preparationTime: 10, isAvailable: true },
    { categoryId: createdCategories[2].id, restaurantId, name: "Basmati Rice", description: "Steamed long grain rice", price: 500, preparationTime: 15, isAvailable: true },
  ] : [
    { categoryId: createdCategories[0].id, restaurantId, name: "Grilled Beef Steak", description: "Premium beef steak", price: 3500, preparationTime: 20, isAvailable: true },
    { categoryId: createdCategories[0].id, restaurantId, name: "Grilled Chicken Quarter", description: "Tender chicken", price: 2500, preparationTime: 15, isAvailable: true },
    { categoryId: createdCategories[1].id, restaurantId, name: "Sadza", description: "Traditional maize meal", price: 500, preparationTime: 10, isAvailable: true },
    { categoryId: createdCategories[2].id, restaurantId, name: "Coke", description: "Cold Coca Cola", price: 300, preparationTime: 1, isAvailable: true },
  ];

  for (const item of itemsData) {
    await db.insert(menuItems).values(item);
    console.log(`  ✅ Created menu item: ${item.name}`);
  }

  console.log(`✅ Reseed for ${restaurant.name} complete!`);
  await connection.end();
}

async function run() {
  const targetId = process.argv[2] ? parseInt(process.argv[2]) : null;
  if (targetId) {
    await reseedRestaurant(targetId);
  } else {
    // Default to common ones
    await reseedRestaurant(360001);
    await reseedRestaurant(360002);
  }
}

run().catch(console.error);
