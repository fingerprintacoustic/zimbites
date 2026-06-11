import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerDevLoginRoute } from "./devLogin";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { startDatabaseKeepAlive, stopDatabaseKeepAlive } from "./db-keepalive";
import * as db from "../db";
import { menuCategories, menuItems } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  app.set("trust proxy", 1);
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  registerDevLoginRoute(app);

  // Scheduled Auto-Heal Route
  app.post("/api/scheduled/auto-heal", async (req, res) => {
    console.log("[Auto-Heal] Starting check...");
    try {
      const database = await db.getDb();
      if (!database) throw new Error("Database not available");

      const allRestaurants = await db.getApprovedRestaurants();
      let healedCount = 0;

      for (const restaurant of allRestaurants) {
        const categories = await database
          .select()
          .from(menuCategories)
          .where(eq(menuCategories.restaurantId, restaurant.id));

        if (categories.length === 0) {
          console.log(`[Auto-Heal] Restaurant ${restaurant.name} (ID: ${restaurant.id}) has no menu. Reseeding...`);
          
          // Basic Reseed Logic
          const catData = [
            { restaurantId: restaurant.id, name: "Main Course", description: "Delicious main dishes" },
            { restaurantId: restaurant.id, name: "Sides", description: "Tasty sides" },
            { restaurantId: restaurant.id, name: "Drinks", description: "Refreshing beverages" },
          ];

          for (const cat of catData) {
            const result = await database.insert(menuCategories).values(cat);
            const catId = (result as any)[0].insertId;
            
            await database.insert(menuItems).values({
              restaurantId: restaurant.id,
              categoryId: Number(catId),
              name: `Sample ${cat.name} Item`,
              description: "Automatically generated for self-healing",
              price: 1000,
              isAvailable: 1,
              preparationTime: 15
            });
          }
          healedCount++;
        }
      }

      res.json({ success: true, healedCount });
    } catch (error) {
      console.error("[Auto-Heal] Error:", error);
      res.status(500).json({ error: String(error) });
    }
  });

  // Error Reporting Route
  app.post("/api/report-error", async (req, res) => {
    const { error, stack, url } = req.body;
    console.error(`[Frontend Error] ${error} at ${url}`);
    
    // Here we would trigger Manus API if MANUS_API_KEY is available
    if (process.env.MANUS_API_KEY) {
      try {
        const response = await fetch("https://api.manus.im/v2/task.create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.MANUS_API_KEY}`
          },
          body: JSON.stringify({
            message: {
              content: `The Zimbites frontend reported an error at ${url}: ${error}. Stack: ${stack}. Please investigate and fix.`
            }
          })
        });
        const data = await response.json();
        console.log("[Manus Trigger] Task created:", data);
      } catch (e) {
        console.error("[Manus Trigger] Failed:", e);
      }
    }
    
    res.json({ success: true });
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    // Start database keep-alive mechanism
    startDatabaseKeepAlive();
  });

  // Handle graceful shutdown
  process.on("SIGTERM", () => {
    console.log("SIGTERM received, shutting down gracefully...");
    stopDatabaseKeepAlive();
    server.close(() => {
      console.log("Server closed");
      process.exit(0);
    });
  });

  process.on("SIGINT", () => {
    console.log("SIGINT received, shutting down gracefully...");
    stopDatabaseKeepAlive();
    server.close(() => {
      console.log("Server closed");
      process.exit(0);
    });
  });
}

startServer().catch(console.error);
