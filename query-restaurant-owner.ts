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

    // Get restaurant owner
    const [rows] = await connection.execute(
      "SELECT id, ownerId, name FROM restaurants WHERE id = 360001"
    );
    console.log("Restaurant:", rows);

    // Get owner user
    const [owner] = await connection.execute(
      "SELECT id, openId, name, email, role FROM users WHERE id = (SELECT ownerId FROM restaurants WHERE id = 360001)"
    );
    console.log("Owner:", owner);

    await connection.end();
  } catch (error) {
    console.error("Error:", error);
  }
}

query();
