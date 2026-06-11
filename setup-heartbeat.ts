import dotenv from "dotenv";
dotenv.config();

import { createHeartbeatJob, listHeartbeatJobs } from "./server/_core/heartbeat";

async function setup() {
  console.log("Checking existing heartbeat jobs...");
  try {
    const { jobs } = await listHeartbeatJobs("");
    const existing = jobs.find(j => j.name === "auto-heal-menus");
    
    if (existing) {
      console.log("Auto-heal job already exists:", existing.taskUid);
      return;
    }

    console.log("Creating auto-heal-menus heartbeat job...");
    const result = await createHeartbeatJob({
      name: "auto-heal-menus",
      cron: "0 0 * * * *", // Every hour at minute 0
      path: "/api/scheduled/auto-heal",
      method: "POST",
      description: "Checks and repairs missing restaurant menus every hour"
    }, "");

    console.log("✅ Auto-heal job created successfully:", result.taskUid);
  } catch (error) {
    console.error("❌ Failed to setup heartbeat:", error);
  }
}

setup().catch(console.error);
