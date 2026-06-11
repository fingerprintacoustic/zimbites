import dotenv from "dotenv";
dotenv.config();

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

async function seedSpiceGarden() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error("DATABASE_URL not set");

  const connection = await mysql.createConnection(dbUrl);

  const restaurantId = 360002; // Spice Garden

  // Insert menu categories (without description column)
  await connection.execute(
    `INSERT INTO menuCategories (restaurantId, name, displayOrder, createdAt, updatedAt) 
     VALUES 
     (?, ?, ?, NOW(), NOW()),
     (?, ?, ?, NOW(), NOW()),
     (?, ?, ?, NOW(), NOW())`,
    [
      restaurantId, "Curries", 1,
      restaurantId, "Breads", 2,
      restaurantId, "Beverages", 3
    ]
  );

  // Get the inserted category IDs
  const [categories] = await connection.execute(
    `SELECT id FROM menuCategories WHERE restaurantId = ? ORDER BY displayOrder`,
    [restaurantId]
  );

  const categoryIds = (categories as any[]).map(c => c.id);

  // Insert menu items
  const items = [
    { categoryId: categoryIds[0], name: "Butter Chicken", description: "Creamy tomato-based curry", price: 4500, prepTime: 20 },
    { categoryId: categoryIds[0], name: "Paneer Tikka Masala", description: "Cottage cheese in spiced sauce", price: 4000, prepTime: 18 },
    { categoryId: categoryIds[0], name: "Lamb Biryani", description: "Fragrant rice with tender lamb", price: 5500, prepTime: 25 },
    { categoryId: categoryIds[1], name: "Garlic Naan", description: "Soft bread with garlic butter", price: 1500, prepTime: 5 },
    { categoryId: categoryIds[1], name: "Roti", description: "Whole wheat flatbread", price: 800, prepTime: 3 },
    { categoryId: categoryIds[2], name: "Mango Lassi", description: "Yogurt-based mango drink", price: 1200, prepTime: 2 },
    { categoryId: categoryIds[2], name: "Chai", description: "Traditional spiced tea", price: 600, prepTime: 3 }
  ];

  for (const item of items) {
    await connection.execute(
      `INSERT INTO menuItems (restaurantId, categoryId, name, description, price, preparationTime, isAvailable, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, 1, NOW(), NOW())`,
      [restaurantId, item.categoryId, item.name, item.description, item.price, item.prepTime]
    );
  }

  console.log("✅ Spice Garden menu seeded successfully!");
  console.log(`- ${categoryIds.length} categories created`);
  console.log(`- ${items.length} items created`);

  await connection.end();
}

seedSpiceGarden().catch(console.error);
