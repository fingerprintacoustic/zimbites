import dotenv from "dotenv";
dotenv.config();

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { users, restaurants } from "./drizzle/schema";
import { eq } from "drizzle-orm";

async function checkRestaurantOwner() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error("DATABASE_URL not set");

  const connection = await mysql.createConnection(dbUrl);
  const db = drizzle(connection);

  // Get restaurant owner
  const owners = await db
    .select()
    .from(users)
    .where(eq(users.role, "restaurant"));

  console.log("Restaurant owners:");
  owners.forEach(o => {
    console.log(`- ID: ${o.id}, Email: ${o.email}, OpenID: ${o.openId}`);
  });

  // Get restaurants
  const rests = await db.select().from(restaurants);
  console.log("\nRestaurants:");
  rests.forEach(r => {
    console.log(`- ID: ${r.id}, Name: ${r.name}, Owner ID: ${r.ownerId}`);
  });

  await connection.end();
}

checkRestaurantOwner().catch(console.error);
