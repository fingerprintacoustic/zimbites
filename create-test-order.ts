import dotenv from "dotenv";
dotenv.config();

import mysql from "mysql2/promise";

async function createTestOrder() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error("DATABASE_URL not set");

  const connection = await mysql.createConnection(dbUrl);

  // Create order for Spice Garden (restaurant 360002)
  const [result] = await connection.execute(
    `INSERT INTO orders (customerId, restaurantId, deliveryAddress, status, paymentMethod, totalAmount, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
    [90001, 360002, "123 Harare Street", "pending", "cash", 4500]
  );

  const orderId = (result as any).insertId;

  // Get a menu item from Spice Garden
  const [items] = await connection.execute(
    `SELECT id FROM menuItems WHERE restaurantId = 360002 LIMIT 1`
  );

  if ((items as any[]).length === 0) {
    console.log("No menu items found for Spice Garden");
    await connection.end();
    return;
  }

  const menuItemId = (items as any[])[0].id;

  // Add item to order
  await connection.execute(
    `INSERT INTO orderItems (orderId, menuItemId, quantity, price, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, NOW(), NOW())`,
    [orderId, menuItemId, 1, 4500]
  );

  console.log(`✅ Test order created!`);
  console.log(`- Order ID: ${orderId}`);
  console.log(`- Restaurant: Spice Garden (360002)`);
  console.log(`- Status: pending`);
  console.log(`- Total: ZWL 45.00`);

  await connection.end();
}

createTestOrder().catch(console.error);
