/**
 * Database Keep-Alive Module
 * 
 * Periodically pings the TiDB database to prevent cold starts and connection timeouts.
 * This module runs a lightweight query every 10 minutes to keep the database connection warm.
 */

import { getDb } from "../db";
import { sql } from "drizzle-orm";

let keepAliveInterval: NodeJS.Timer | null = null;
let isRunning = false;

/**
 * Start the database keep-alive mechanism
 * Runs a simple query every 10 minutes to keep the connection alive
 */
export async function startDatabaseKeepAlive() {
  if (isRunning) {
    console.log("Database keep-alive is already running");
    return;
  }

  isRunning = true;
  console.log("🔄 Starting database keep-alive mechanism...");

  // Run initial ping immediately
  await pingDatabase();

  // Set up interval to ping every 10 minutes (600,000 ms)
  keepAliveInterval = setInterval(async () => {
    await pingDatabase();
  }, 10 * 60 * 1000); // 10 minutes

  // Ensure the interval doesn't prevent the process from exiting
  if (keepAliveInterval.unref) {
    keepAliveInterval.unref();
  }

  console.log("✅ Database keep-alive is active (pinging every 10 minutes)");
}

/**
 * Stop the database keep-alive mechanism
 */
export function stopDatabaseKeepAlive() {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
    keepAliveInterval = null;
    isRunning = false;
    console.log("🛑 Database keep-alive stopped");
  }
}

/**
 * Ping the database with a lightweight query
 */
async function pingDatabase() {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("⚠️  Database not available for keep-alive ping");
      return;
    }

    // Execute a simple SELECT 1 query to keep the connection alive
    const result = await db.execute(sql`SELECT 1 as ping`);
    
    const timestamp = new Date().toISOString();
    console.log(`✅ Database keep-alive ping successful at ${timestamp}`);
  } catch (error) {
    const timestamp = new Date().toISOString();
    console.error(
      `❌ Database keep-alive ping failed at ${timestamp}:`,
      error instanceof Error ? error.message : String(error)
    );
  }
}

/**
 * Get the current status of the keep-alive mechanism
 */
export function getKeepAliveStatus() {
  return {
    isRunning,
    interval: "10 minutes",
    nextPingIn: keepAliveInterval ? "~10 minutes" : "N/A"
  };
}
