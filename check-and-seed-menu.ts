import { getDb } from "./server/db";

async function checkAndSeed() {
  const db = await getDb();

  // Check existing categories
  const existingCategories = await db.execute(
    `SELECT COUNT(*) as count FROM menuCategories WHERE restaurantId = 360001`
  );
  
  console.log("Existing categories for restaurant 360001:", existingCategories);

  // If no categories, seed them
  const categories = existingCategories[0]?.count || 0;
  if (categories === 0) {
    console.log("No categories found. Seeding...");

    // Insert categories
    const categoryIds: number[] = [];
    const categoryNames = ["Grilled Meats", "Sides", "Drinks"];

    for (const name of categoryNames) {
      const result = await db.execute(
        `INSERT INTO menuCategories (restaurantId, name, description) VALUES (360001, ?, ?)`,
        [name, `${name} from Harare Grill House`]
      );
      console.log(`✅ Created category: ${name}`);
    }

    // Get the category IDs
    const cats = await db.execute(
      `SELECT id FROM menuCategories WHERE restaurantId = 360001 ORDER BY id`
    );

    console.log("Categories created:", cats);

    // Seed menu items for each category
    const menuItems = [
      { categoryIndex: 0, name: "Grilled Beef Steak", price: 3500, prepTime: 20 },
      { categoryIndex: 0, name: "Grilled Chicken Quarter", price: 2500, prepTime: 15 },
      { categoryIndex: 0, name: "Pork Chops", price: 2800, prepTime: 18 },
      { categoryIndex: 1, name: "Sadza", price: 500, prepTime: 10 },
      { categoryIndex: 1, name: "Vegetables", price: 400, prepTime: 8 },
      { categoryIndex: 2, name: "Coke", price: 300, prepTime: 1 },
      { categoryIndex: 2, name: "Fanta", price: 300, prepTime: 1 },
    ];

    for (const item of menuItems) {
      const categoryId = cats[item.categoryIndex]?.id;
      if (categoryId) {
        await db.execute(
          `INSERT INTO menuItems (categoryId, name, description, price, preparationTime, isAvailable) 
           VALUES (?, ?, ?, ?, ?, true)`,
          [categoryId, item.name, `Delicious ${item.name}`, item.price, item.prepTime]
        );
        console.log(`✅ Created menu item: ${item.name}`);
      }
    }

    console.log("✅ Seeding complete!");
  } else {
    console.log(`✅ Found ${categories} categories for restaurant 360001`);
  }

  // Verify the data
  const finalCheck = await db.execute(
    `SELECT mc.id, mc.name, COUNT(mi.id) as itemCount 
     FROM menuCategories mc 
     LEFT JOIN menuItems mi ON mc.id = mi.categoryId 
     WHERE mc.restaurantId = 360001 
     GROUP BY mc.id, mc.name`
  );

  console.log("\nFinal verification:");
  console.log(JSON.stringify(finalCheck, null, 2));
}

checkAndSeed().catch(console.error);
