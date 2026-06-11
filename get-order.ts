import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

async function query() {
  let connection;
  try {
    const url = new URL(DATABASE_URL!);
    connection = await mysql.createConnection({
      host: url.hostname,
      port: url.port ? parseInt(url.port) : 3306,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
      ssl: { rejectUnauthorized: false }
    });

    // Get the latest order
    const [rows] = await connection.execute(
      "SELECT id, status, restaurantId FROM orders ORDER BY id DESC LIMIT 1"
    );
    console.log("Latest Order:", rows);

    await connection.end();
  } catch (error) {
    console.error("Error:", error);
  }
}

query();
