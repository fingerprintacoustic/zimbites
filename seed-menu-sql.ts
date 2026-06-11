/**
 * Seed menu data using raw SQL
 * Run with: npx tsx seed-menu-sql.ts
 */

import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable not set");
  process.exit(1);
}

async function seedMenu() {
  console.log("🌱 Seeding menu using raw SQL...\n");

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

    const restaurantId = 360001;

    // Insert categories
    console.log("📝 Inserting menu categories...");
    const categories = [
      { name: "Grilled Meats", description: "Premium grilled beef, chicken, and pork", displayOrder: 1 },
      { name: "Sides", description: "Vegetables, grains, and traditional sides", displayOrder: 2 },
      { name: "Drinks", description: "Beverages and refreshments", displayOrder: 3 },
    ];

    for (const cat of categories) {
      const sql = `INSERT INTO menuCategories (restaurantId, name, description, displayOrder, isActive, createdAt, updatedAt) 
                   VALUES (?, ?, ?, ?, 1, NOW(), NOW())
                   ON DUPLICATE KEY UPDATE displayOrder = ?`;
      await connection.execute(sql, [restaurantId, cat.name, cat.description, cat.displayOrder, cat.displayOrder]);
      console.log(`  ✓ ${cat.name}`);
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

    // Insert menu items
    console.log("\n🍽️  Inserting menu items...");
    const menuItems = [
      { categoryName: "Grilled Meats", name: "Grilled Beef Steak", description: "Premium 250g beef steak grilled to perfection", price: 3500, preparationTime: 20 },
      { categoryName: "Grilled Meats", name: "Grilled Chicken Quarter", description: "Half chicken marinated and grilled", price: 2500, preparationTime: 15 },
      { categoryName: "Grilled Meats", name: "Pork Chops", description: "Two thick-cut pork chops with herbs", price: 2800, preparationTime: 18 },
      { categoryName: "Grilled Meats", name: "Mixed Grill Platter", description: "Combination of beef, chicken, and pork", price: 5500, preparationTime: 25 },
      { categoryName: "Grilled Meats", name: "Lamb Chops", description: "Tender lamb chops with mint sauce", price: 4000, preparationTime: 22 },
      { categoryName: "Grilled Meats", name: "Boerewors Roll", description: "Traditional South African sausage roll", price: 1200, preparationTime: 10 },
      { categoryName: "Grilled Meats", name: "Grilled Fish Fillet", description: "Fresh tilapia grilled with lemon butter", price: 3200, preparationTime: 18 },
      { categoryName: "Grilled Meats", name: "BBQ Ribs", description: "Slow-grilled pork ribs with BBQ sauce", price: 4200, preparationTime: 30 },
      { categoryName: "Sides", name: "Chip Chips", description: "Crispy fried potatoes", price: 800, preparationTime: 8 },
      { categoryName: "Sides", name: "Coleslaw", description: "Fresh creamy coleslaw", price: 500, preparationTime: 2 },
      { categoryName: "Sides", name: "Grilled Vegetables", description: "Seasonal vegetables grilled", price: 700, preparationTime: 10 },
      { categoryName: "Sides", name: "Sadza", description: "Traditional maize porridge", price: 400, preparationTime: 5 },
      { categoryName: "Drinks", name: "Soft Drink", description: "Assorted soft drinks 330ml", price: 300, preparationTime: 1 },
      { categoryName: "Drinks", name: "Fresh Juice", description: "Freshly squeezed juice", price: 600, preparationTime: 3 },
      { categoryName: "Drinks", name: "Water", description: "Bottled water 500ml", price: 200, preparationTime: 1 },
    ];

    for (const item of menuItems) {
      const categoryId = catMap[item.categoryName];
      if (!categoryId) {
        console.warn(`  ⚠ Category not found: ${item.categoryName}`);
        continue;
      }
      const sql = `INSERT INTO menuItems (restaurantId, categoryId, name, description, price, preparationTime, isAvailable, createdAt, updatedAt) 
                   VALUES (?, ?, ?, ?, ?, ?, 1, NOW(), NOW())
                   ON DUPLICATE KEY UPDATE price = ?`;
      await connection.execute(sql, [restaurantId, categoryId, item.name, item.description, item.price, item.preparationTime, item.price]);
      console.log(`  ✓ ${item.name}`);
    }

    console.log("\n✅ Menu items inserted");
    console.log("🎉 Seeding complete!");
    await connection.end();
  } catch (error) {
    console.error("❌ Error:", error);
    if (connection) await connection.end();
    process.exit(1);
  }
}

seedMenu();
