import { test as setup, expect } from "@playwright/test";
import { LoginPage } from "./pages";

/**
 * Global setup for E2E tests
 * Runs once before all tests
 */
setup("global setup", async () => {
  console.log("Setting up E2E test environment...");
  
  // Verify test environment is ready
  const baseUrl = process.env.BASE_URL || "http://localhost:3000";
  
  // In CI, we skip webServer configuration and assume server is already running
  if (!process.env.CI) {
    console.log(`Base URL: ${baseUrl}`);
    console.log("Tests will run against local development server");
  }
  
  console.log("E2E test environment ready");
});

/**
 * Global teardown
 * Runs once after all tests
 */
setup("global teardown", async () => {
  console.log("Cleaning up E2E test environment...");
  // Add any cleanup logic here
  console.log("E2E test environment cleanup complete");
});