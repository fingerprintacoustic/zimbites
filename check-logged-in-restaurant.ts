import dotenv from "dotenv";
dotenv.config();

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { users, restaurants } from "./drizzle/schema";
import { eq } from "drizzle-orm";

async function checkRestaurant() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error("DATABASE_URL not set");

  const connection = await mysql.createConnection(dbUrl);
  const db = drizzle(connection);

  // Get the restaurant-demo-002 user
  const user = await db
    .select()
    .from(users)
    .where(eq(users.openId, "restaurant-demo-002"));

  if (user.length === 0) {
    console.log("User not found");
    await connection.end();
    return;
  }

  console.log("User:", user[0]);

  // Get restaurants owned by this user
  const rests = await db
    .select()
    .from(restaurants)
    .where(eq(restaurants.ownerId, user[0].id));

  console.log("\nRestaurants owned by this user:");
  rests.forEach(r => {
    console.log(`- ID: ${r.id}, Name: ${r.name}`);
  });

  await connection.end();
}

checkRestaurant().catch(console.error);
