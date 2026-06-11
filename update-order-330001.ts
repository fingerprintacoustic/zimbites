import dotenv from "dotenv";
dotenv.config();

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { orders } from "./drizzle/schema";
import { eq } from "drizzle-orm";

async function updateOrder() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error("DATABASE_URL not set");
  }

  const connection = await mysql.createConnection(dbUrl);
  const db = drizzle(connection);

  console.log("Updating order 330001 to delivered status...");

  await db
    .update(orders)
    .set({ status: "delivered" })
    .where(eq(orders.id, 330001));

  console.log("✅ Order updated to delivered");

  const updated = await db
    .select()
    .from(orders)
    .where(eq(orders.id, 330001));

  console.log("Updated order status:", updated[0].status);

  await connection.end();
}

updateOrder().catch(console.error);
