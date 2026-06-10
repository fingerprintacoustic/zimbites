import * as db from "./server/db";
import { restaurants } from "./drizzle/schema";
import { eq } from "drizzle-orm";

async function main() {
  console.log("Inserting Mama Africa Kitchen...");
  try {
    const database = await db.getDb();
    if (!database) {
      console.error("Database not available. Make sure DATABASE_URL is set.");
      process.exit(1);
    }

    // Insert the restaurant
    // ownerId: 1 as requested in the SQL
    await database.insert(restaurants).values({
      ownerId: 1,
      name: "Mama Africa Kitchen",
      description: "Authentic Zimbabwean cuisine",
      address: "45 Samora Machel Ave, Harare",
      phoneNumber: "+263771234567",
      isActive: 1,
      isApproved: 1, // Auto-approve for convenience
    }).onDuplicateKeyUpdate({
      set: {
        description: "Authentic Zimbabwean cuisine",
        address: "45 Samora Machel Ave, Harare",
        phoneNumber: "+263771234567",
        isActive: 1,
      }
    });

    console.log("Successfully inserted/updated Mama Africa Kitchen.");
    process.exit(0);
  } catch (error) {
    console.error("Error inserting restaurant:", error);
    process.exit(1);
  }
}

main();
