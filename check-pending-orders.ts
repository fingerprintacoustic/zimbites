import dotenv from "dotenv";
dotenv.config();

import mysql from "mysql2/promise";

async function checkOrders() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error("DATABASE_URL not set");

  const connection = await mysql.createConnection(dbUrl);

  // Check pending orders for restaurant 360001
  const [pendingOrders] = await connection.execute(
    `SELECT id, orderNumber, status FROM orders WHERE restaurantId = 360001 AND status = 'pending'`
  );

  console.log("Pending orders for restaurant 360001:");
  console.log(pendingOrders);

  // Check confirmed orders for restaurant 360001
  const [confirmedOrders] = await connection.execute(
    `SELECT id, orderNumber, status FROM orders WHERE restaurantId = 360001 AND status = 'confirmed'`
  );

  console.log("\nConfirmed orders for restaurant 360001:");
  console.log(confirmedOrders);

  await connection.end();
}

checkOrders().catch(console.error);
