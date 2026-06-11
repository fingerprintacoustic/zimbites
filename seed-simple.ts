/**
 * Simple seed script with better error handling
 * Run with: npx tsx seed-simple.ts
 */

import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable not set");
  process.exit(1);
}

async function seed() {
  console.log("🌱 Starting seed...\n");

  let connection;
  try {
    // Create connection
    const url = new URL(DATABASE_URL);
    console.log(`Connecting to ${url.hostname}...`);
    connection = await mysql.createConnection({
      host: url.hostname,
      port: url.port ? parseInt(url.port) : 3306,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
      ssl: { rejectUnauthorized: false }
    });
    console.log("✅ Connected\n");

    const restaurantId = 360001;

    // First, clear any existing data
    console.log("🧹 Clearing existing menu items and categories...");
    await connection.execute("DELETE FROM menuItems WHERE restaurantId = ?", [restaurantId]);
    await connection.execute("DELETE FROM menuCategories WHERE restaurantId = ?", [restaurantId]);
    console.log("✅ Cleared\n");

    // Insert categories
    console.log("📝 Inserting categories...");
    const categories = [
      { name: "Grilled Meats", description: "Premium grilled beef, chicken, and pork", displayOrder: 1 },
      { name: "Sides", description: "Vegetables, grains, and traditional sides", displayOrder: 2 },
      { name: "Drinks", description: "Beverages and refreshments", displayOrder: 3 },
    ];

    for (const cat of categories) {
      const sql = `INSERT INTO menuCategories (restaurantId, name, description, displayOrder, isActive, createdAt, updatedAt) 
                   VALUES (?, ?, ?, ?, 1, NOW(), NOW())`;
      const result = await connection.execute(sql, [restaurantId, cat.name, cat.description, cat.displayOrder]);
      console.log(`  ✓ ${cat.name} - ${JSON.stringify(result[0])}`);
    }

    console.log("✅ Categories inserted\n");

    // Get category IDs
    console.log("🔍 Fetching category IDs...");
    const [catRows] = await connection.execute(
      "SELECT id, name FROM menuCategories WHERE restaurantId = ? ORDER BY displayOrder",
      [restaurantId]
    );
    const catMap: { [key: string]: number } = {};
    (catRows as any[]).forEach(row => {
      catMap[row.name] = row.id;
      console.log(`  - ${row.name}: ${row.id}`);
    });
    console.log();

    // Insert menu items
    console.log("🍽️  Inserting menu items...");
    const menuItems = [
      { categoryName: "Grilled Meats", name: "Grilled Beef Steak", description: "Premium 250g beef steak grilled to perfection", price: 3500, preparationTime: 20 },
      { categoryName: "Grilled Meats", name: "Grilled Chicken Quarter", description: "Half chicken marinated and grilled", price: 2500, preparationTime: 15 },
      { categoryName: "Grilled Meats", name: "Pork Chops", description: "Two thick-cut pork chops with herbs", price: 2800, preparationTime: 18 },
      { categoryName: "Sides", name: "Chip Chips", description: "Crispy fried potatoes", price: 800, preparationTime: 8 },
      { categoryName: "Sides", name: "Coleslaw", description: "Fresh creamy coleslaw", price: 500, preparationTime: 2 },
      { categoryName: "Drinks", name: "Soft Drink", description: "Assorted soft drinks 330ml", price: 300, preparationTime: 1 },
      { categoryName: "Drinks", name: "Fresh Juice", description: "Freshly squeezed juice", price: 600, preparationTime: 3 },
    ];

    for (const item of menuItems) {
      const categoryId = catMap[item.categoryName];
      if (!categoryId) {
        console.warn(`  ⚠ Category not found: ${item.categoryName}`);
        continue;
      }
      const sql = `INSERT INTO menuItems (restaurantId, categoryId, name, description, price, preparationTime, isAvailable, createdAt, updatedAt) 
                   VALUES (?, ?, ?, ?, ?, ?, 1, NOW(), NOW())`;
      const result = await connection.execute(sql, [restaurantId, categoryId, item.name, item.description, item.price, item.preparationTime]);
      console.log(`  ✓ ${item.name} - ${JSON.stringify(result[0])}`);
    }

    console.log("\n✅ Menu items inserted");

    // Verify
    console.log("\n🔍 Verifying data...");
    const [verifyItems] = await connection.execute(
      "SELECT COUNT(*) as count FROM menuItems WHERE restaurantId = ?",
      [restaurantId]
    );
    console.log(`Total items: ${(verifyItems as any[])[0].count}`);

    console.log("\n🎉 Seed complete!");
    await connection.end();
  } catch (error) {
    console.error("❌ Error:", error);
    if (connection) await connection.end();
    process.exit(1);
  }
}

seed();
