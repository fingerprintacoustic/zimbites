import * as dotenv from "dotenv";
dotenv.config();

import * as mysql from "mysql2/promise";

async function checkRestaurant() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error("DATABASE_URL not set");

  console.log("Attempting to connect to database...");
  const connection = await mysql.createConnection(dbUrl);
  console.log("Database connected.");

  console.log("Querying for restaurant 360002...");
  const [restaurants] = await connection.execute(
    `SELECT id, name, ownerId FROM restaurants WHERE id = 360002`
  );
  console.log("Restaurant query complete.");

  console.log("Restaurant 360002:");
  console.log(restaurants);

  console.log("Querying for restaurant owner...");
  const [users] = await connection.execute(
    `SELECT id, openId, role FROM users WHERE id = (SELECT ownerId FROM restaurants WHERE id = 360002)`
  );
  console.log("Owner query complete.");

  console.log("\nRestaurant owner:");
  console.log(users);

  await connection.end();
}

checkRestaurant().catch(console.error);
