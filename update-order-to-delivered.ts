import dotenv from "dotenv";
dotenv.config();

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { orders } from "./drizzle/schema";
import { eq } from "drizzle-orm";

async function updateOrderStatus() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error("DATABASE_URL not set");
  }

  const connection = await mysql.createConnection(dbUrl);
  const db = drizzle(connection);

  // Get the latest order
  const latestOrder = await db
    .select()
    .from(orders)
    .orderBy(orders.id)
    .limit(1);

  if (!latestOrder || latestOrder.length === 0) {
    throw new Error("No orders found");
  }

  const orderId = latestOrder[0].id;
  console.log(`Updating order ${orderId} to delivered status...`);

  // Update order status to delivered
  await db
    .update(orders)
    .set({ status: "delivered" })
    .where(eq(orders.id, orderId));

  console.log(`✅ Order ${orderId} status updated to: delivered`);

  // Verify
  const updated = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId));

  console.log("Updated order:", updated[0]);

  await connection.end();
}

updateOrderStatus().catch(console.error);
