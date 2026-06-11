import dotenv from "dotenv";
dotenv.config();

import mysql from "mysql2/promise";

async function checkRestaurant() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error("DATABASE_URL not set");

  const connection = await mysql.createConnection(dbUrl);

  // Get the restaurant owner for restaurant 360001
  const [restaurants] = await connection.execute(
    `SELECT id, name, ownerId FROM restaurants WHERE id = 360001`
  );

  console.log("Restaurant 360001:");
  console.log(restaurants);

  // Get the user info for that owner
  const [users] = await connection.execute(
    `SELECT id, openId, role FROM users WHERE id = (SELECT ownerId FROM restaurants WHERE id = 360001)`
  );

  console.log("\nRestaurant owner:");
  console.log(users);

  await connection.end();
}

checkRestaurant().catch(console.error);
