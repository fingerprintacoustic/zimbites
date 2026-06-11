import dotenv from "dotenv";
dotenv.config();

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { orders } from "./drizzle/schema";
import { desc } from "drizzle-orm";

async function getLatestOrder() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error("DATABASE_URL not set");
  }

  const connection = await mysql.createConnection(dbUrl);
  const db = drizzle(connection);

  // Get the latest order by creation date
  const latestOrder = await db
    .select()
    .from(orders)
    .orderBy(desc(orders.createdAt))
    .limit(1);

  if (!latestOrder || latestOrder.length === 0) {
    throw new Error("No orders found");
  }

  console.log("Latest order:");
  console.log(JSON.stringify(latestOrder[0], null, 2));

  await connection.end();
}

getLatestOrder().catch(console.error);
