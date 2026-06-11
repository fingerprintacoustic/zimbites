/**
 * Verify menu data in production database
 * Run with: npx tsx verify-menu-data.ts
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

async function verifyData() {
  console.log("🔍 Verifying menu data for restaurant 360001...\n");

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

    // Check categories
    console.log("📋 Menu Categories:");
    const categories = await db.select().from(schema.menuCategories)
      .where((c) => c.restaurantId === restaurantId);
    console.log(`Found ${categories.length} categories`);
    categories.forEach(cat => {
      console.log(`  - ${cat.name} (ID: ${cat.id}, Active: ${cat.isActive})`);
    });

    // Check menu items
    console.log("\n🍽️  Menu Items:");
    const items = await db.select().from(schema.menuItems)
      .where((i) => i.restaurantId === restaurantId);
    console.log(`Found ${items.length} items`);
    items.slice(0, 5).forEach(item => {
      console.log(`  - ${item.name} (ID: ${item.id}, Category: ${item.categoryId}, Active: ${item.isActive})`);
    });
    if (items.length > 5) {
      console.log(`  ... and ${items.length - 5} more`);
    }

    console.log("\n✅ Verification complete!");
    await connection.end();
  } catch (error) {
    console.error("❌ Error:", error);
    if (connection) await connection.end();
    process.exit(1);
  }
}

verifyData();
