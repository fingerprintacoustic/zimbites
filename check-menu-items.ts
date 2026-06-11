/**
 * Check menu items in database
 * Run with: npx tsx check-menu-items.ts
 */

import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable not set");
  process.exit(1);
}

async function checkItems() {
  console.log("🔍 Checking menu items...\n");

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

    // Check all menu items for restaurant 360001
    console.log("📋 All menu items for restaurant 360001:");
    const [allItems] = await connection.execute(
      "SELECT id, categoryId, name, isAvailable FROM menuItems WHERE restaurantId = 360001 LIMIT 20",
      []
    );
    console.log(`Found ${(allItems as any[]).length} items`);
    (allItems as any[]).forEach(item => {
      console.log(`  - ID: ${item.id}, Category: ${item.categoryId}, Name: ${item.name}, Available: ${item.isAvailable}`);
    });

    // Check items for category 540004
    console.log("\n📋 Items for category 540004:");
    const [catItems] = await connection.execute(
      "SELECT id, categoryId, name, isAvailable FROM menuItems WHERE categoryId = 540004",
      []
    );
    console.log(`Found ${(catItems as any[]).length} items`);
    (catItems as any[]).forEach(item => {
      console.log(`  - ID: ${item.id}, Name: ${item.name}, Available: ${item.isAvailable}`);
    });

    // Check items with isAvailable = 1
    console.log("\n📋 Items with isAvailable = 1:");
    const [availItems] = await connection.execute(
      "SELECT id, categoryId, name, isAvailable FROM menuItems WHERE categoryId = 540004 AND isAvailable = 1",
      []
    );
    console.log(`Found ${(availItems as any[]).length} items`);
    (availItems as any[]).forEach(item => {
      console.log(`  - ID: ${item.id}, Name: ${item.name}`);
    });

    console.log("\n✅ Check complete!");
    await connection.end();
  } catch (error) {
    console.error("❌ Error:", error);
    if (connection) await connection.end();
    process.exit(1);
  }
}

checkItems();
