import dotenv from "dotenv";
dotenv.config();

import mysql from "mysql2/promise";

async function checkOrder() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error("DATABASE_URL not set");

  const connection = await mysql.createConnection(dbUrl);

  // Check if order 120001 exists
  const [orders] = await connection.execute(
    `SELECT id, orderNumber, status, restaurantId FROM orders WHERE id = 120001 OR orderNumber LIKE '%120001%'`
  );

  console.log("Orders matching 120001:");
  console.log(orders);

  // Check all pending orders
  const [pendingOrders] = await connection.execute(
    `SELECT id, orderNumber, status, restaurantId FROM orders WHERE status = 'pending' LIMIT 10`
  );

  console.log("\nAll pending orders:");
  console.log(pendingOrders);

  await connection.end();
}

checkOrder().catch(console.error);
