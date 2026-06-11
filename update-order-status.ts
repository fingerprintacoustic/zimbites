import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

async function updateOrderStatus() {
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

    const orderId = 300001;
    const statuses = ['driver_assigned', 'out_for_delivery', 'delivered', 'customer_confirmed'];

    for (const status of statuses) {
      console.log(`\n📝 Updating order ${orderId} to status: ${status}`);
      const sql = `UPDATE orders SET status = ?, updatedAt = NOW() WHERE id = ?`;
      const result = await connection.execute(sql, [status, orderId]);
      console.log(`✅ Updated: ${status}`);
      
      // Verify
      const [rows] = await connection.execute(
        "SELECT id, status FROM orders WHERE id = ?",
        [orderId]
      );
      console.log(`Current status: ${(rows as any[])[0].status}`);
    }

    console.log("\n🎉 Order status workflow complete!");
    await connection.end();
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

updateOrderStatus();
