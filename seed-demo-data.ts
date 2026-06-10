#!/usr/bin/env node
/**
 * ZimBites Complete Seed Data
 * Populates database with comprehensive test data
 * Run with: npx tsx seed-demo-data.ts
 */

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./drizzle/schema.ts";
import dotenv from "dotenv";
import { eq } from 'drizzle-orm';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable not set");
  process.exit(1);
}

async function seedDatabase() {
  console.log("🌱 Starting ZimBites database seeding...\n");

  let connection;
  try {
    // Create connection
    const url = new URL(DATABASE_URL);
    connection = await mysql.createConnection({
      host: url.hostname,
      port: url.port ? parseInt(url.port) : 3306,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
      ssl: { rejectUnauthorized: false }
    });

    const db = drizzle(connection);

    // ========================================================================
    // 0. CLEANUP EXISTING DEMO DATA
    // ========================================================================
    console.log("🧹 Cleaning up existing demo data...");
    await db.delete(schema.orderItems);
    await db.delete(schema.orderStatusHistory);
    await db.delete(schema.driverAssignments);
    await db.delete(schema.orders);
    await db.delete(schema.notifications);
    await db.delete(schema.cartItems);
    await db.delete(schema.carts);
    await db.delete(schema.menuItems);
    await db.delete(schema.menuCategories);
    await db.delete(schema.restaurants);
    await db.delete(schema.tips);
    await db.delete(schema.ratings);
    await db.delete(schema.driverWallets);
    await db.delete(schema.drivers);
    await db.delete(schema.payments);
    await db.delete(schema.platformSettings);
    await db.delete(schema.users);
    console.log("✅ Cleanup complete\n");

    // ========================================================================
    // 1. CREATE DEMO TEST ACCOUNTS
    // ========================================================================
    console.log("📝 Creating demo test accounts...");

    const demoUsers = [
      // Admin
      { openId: "admin-001", name: "Platform Admin", email: "admin@zimbites.com", loginMethod: "demo", role: "admin" as const },
      // Customers
      { openId: "customer-001", name: "John Smith", email: "john@example.com", loginMethod: "demo", role: "customer" as const },
      { openId: "customer-002", name: "Sarah Johnson", email: "sarah@example.com", loginMethod: "demo", role: "customer" as const },
      { openId: "customer-003", name: "Michael Brown", email: "michael@example.com", loginMethod: "demo", role: "customer" as const },
      { openId: "customer-004", name: "Emily Davis", email: "emily@example.com", loginMethod: "demo", role: "customer" as const },
      { openId: "customer-005", name: "David Wilson", email: "david@example.com", loginMethod: "demo", role: "customer" as const },
      { openId: "customer-006", name: "Lisa Anderson", email: "lisa@example.com", loginMethod: "demo", role: "customer" as const },
      { openId: "customer-007", name: "James Taylor", email: "james@example.com", loginMethod: "demo", role: "customer" as const },
      { openId: "customer-008", name: "Jennifer Martinez", email: "jennifer@example.com", loginMethod: "demo", role: "customer" as const },
      { openId: "customer-009", name: "Robert Garcia", email: "robert@example.com", loginMethod: "demo", role: "customer" as const },
      { openId: "customer-010", name: "Amanda Rodriguez", email: "amanda@example.com", loginMethod: "demo", role: "customer" as const },
      { openId: "customer-011", name: "Christopher Lee", email: "chris@example.com", loginMethod: "demo", role: "customer" as const },
      { openId: "customer-012", name: "Jessica White", email: "jessica@example.com", loginMethod: "demo", role: "customer" as const },
      { openId: "customer-013", name: "Daniel Harris", email: "daniel@example.com", loginMethod: "demo", role: "customer" as const },
      { openId: "customer-014", name: "Ashley Clark", email: "ashley@example.com", loginMethod: "demo", role: "customer" as const },
      { openId: "customer-015", name: "Matthew Lewis", email: "matthew@example.com", loginMethod: "demo", role: "customer" as const },
      { openId: "customer-016", name: "Nicole Walker", email: "nicole@example.com", loginMethod: "demo", role: "customer" as const },
      { openId: "customer-017", name: "Andrew Hall", email: "andrew@example.com", loginMethod: "demo", role: "customer" as const },
      { openId: "customer-018", name: "Stephanie Allen", email: "stephanie@example.com", loginMethod: "demo", role: "customer" as const },
      { openId: "customer-019", name: "Joshua Young", email: "joshua@example.com", loginMethod: "demo", role: "customer" as const },
      { openId: "customer-020", name: "Brittany King", email: "brittany@example.com", loginMethod: "demo", role: "customer" as const },
      // Restaurant Owners
      { openId: "restaurant-001", name: "Chef Marcus Thompson", email: "marcus@zimbites.com", loginMethod: "demo", role: "restaurant" as const },
      { openId: "restaurant-002", name: "Chef Patricia Williams", email: "patricia@zimbites.com", loginMethod: "demo", role: "restaurant" as const },
      { openId: "restaurant-003", name: "Chef David Jones", email: "david@zimbites.com", loginMethod: "demo", role: "restaurant" as const },
      { openId: "restaurant-004", name: "Chef Maria Garcia", email: "maria@zimbites.com", loginMethod: "demo", role: "restaurant" as const },
      { openId: "restaurant-005", name: "Chef Robert Chen", email: "robert@zimbites.com", loginMethod: "demo", role: "restaurant" as const },
      // Drivers
      { openId: "driver-001", name: "Delivery David", email: "david.driver@zimbites.com", loginMethod: "demo", role: "driver" as const },
      { openId: "driver-002", name: "Fast Fiona", email: "fiona.driver@zimbites.com", loginMethod: "demo", role: "driver" as const },
      { openId: "driver-003", name: "Quick Kevin", email: "kevin.driver@zimbites.com", loginMethod: "demo", role: "driver" as const },
      { openId: "driver-004", name: "Speedy Sarah", email: "sarah.driver@zimbites.com", loginMethod: "demo", role: "driver" as const },
      { openId: "driver-005", name: " Reliable Robert", email: "robert.driver@zimbites.com", loginMethod: "demo", role: "driver" as const },
      { openId: "driver-006", name: "Efficient Emma", email: "emma.driver@zimbites.com", loginMethod: "demo", role: "driver" as const },
      { openId: "driver-007", name: "Active Alex", email: "alex.driver@zimbites.com", loginMethod: "demo", role: "driver" as const },
      { openId: "driver-008", name: "Swift Steve", email: "steve.driver@zimbites.com", loginMethod: "demo", role: "driver" as const },
      { openId: "driver-009", name: "Nimble Nancy", email: "nancy.driver@zimbites.com", loginMethod: "demo", role: "driver" as const },
      { openId: "driver-010", name: "Prompt Peter", email: "peter.driver@zimbites.com", loginMethod: "demo", role: "driver" as const },
    ];

    for (const user of demoUsers) {
      await db.insert(schema.users).values(user).onDuplicateKeyUpdate({
        set: { name: user.name, email: user.email, role: user.role }
      });
    }

    console.log("✅ Created 36 demo accounts\n");

    // ========================================================================
    // 2. GET USER IDS
    // ========================================================================
    const users = await db.select().from(schema.users);
    
    const getUserByOpenId = (openId: string) => users.find(u => u.openId === openId)!;
    
    const restaurantOwners = [
      getUserByOpenId("restaurant-001"),
      getUserByOpenId("restaurant-002"),
      getUserByOpenId("restaurant-003"),
      getUserByOpenId("restaurant-004"),
      getUserByOpenId("restaurant-005"),
    ];
    
    const drivers = [
      getUserByOpenId("driver-001"),
      getUserByOpenId("driver-002"),
      getUserByOpenId("driver-003"),
      getUserByOpenId("driver-004"),
      getUserByOpenId("driver-005"),
      getUserByOpenId("driver-006"),
      getUserByOpenId("driver-007"),
      getUserByOpenId("driver-008"),
      getUserByOpenId("driver-009"),
      getUserByOpenId("driver-010"),
    ];

    // ========================================================================
    // 3. CREATE DRIVERS
    // ========================================================================
    console.log("🚗 Creating drivers...");

    const driverData = [
      { userId: drivers[0].id, phoneNumber: "+263 771 111 111", vehicleType: "motorcycle", status: "available" as const, isApproved: 1, totalDeliveries: 156, averageRating: "4.8" },
      { userId: drivers[1].id, phoneNumber: "+263 772 222 222", vehicleType: "car", status: "available" as const, isApproved: 1, totalDeliveries: 203, averageRating: "4.9" },
      { userId: drivers[2].id, phoneNumber: "+263 773 333 333", vehicleType: "motorcycle", status: "available" as const, isApproved: 1, totalDeliveries: 89, averageRating: "4.6" },
      { userId: drivers[3].id, phoneNumber: "+263 774 444 444", vehicleType: "bicycle", status: "available" as const, isApproved: 1, totalDeliveries: 312, averageRating: "4.7" },
      { userId: drivers[4].id, phoneNumber: "+263 775 555 555", vehicleType: "car", status: "available" as const, isApproved: 1, totalDeliveries: 178, averageRating: "4.5" },
      { userId: drivers[5].id, phoneNumber: "+263 776 666 666", vehicleType: "motorcycle", status: "offline" as const, isApproved: 1, totalDeliveries: 245, averageRating: "4.8" },
      { userId: drivers[6].id, phoneNumber: "+263 777 777 777", vehicleType: "motorcycle", status: "available" as const, isApproved: 1, totalDeliveries: 167, averageRating: "4.7" },
      { userId: drivers[7].id, phoneNumber: "+263 778 888 888", vehicleType: "car", status: "available" as const, isApproved: 1, totalDeliveries: 98, averageRating: "4.4" },
      { userId: drivers[8].id, phoneNumber: "+263 779 999 999", vehicleType: "bicycle", status: "offline" as const, isApproved: 1, totalDeliveries: 234, averageRating: "4.6" },
      { userId: drivers[9].id, phoneNumber: "+263 771 000 000", vehicleType: "motorcycle", status: "available" as const, isApproved: 1, totalDeliveries: 189, averageRating: "4.9" },
    ];

    for (const driver of driverData) {
      await db.insert(schema.drivers).values(driver).onDuplicateKeyUpdate({
        set: { status: driver.status, isApproved: 1, totalDeliveries: driver.totalDeliveries }
      });
    }

    console.log("✅ Created 10 drivers\n");

    // ========================================================================
    // 4. CREATE RESTAURANTS
    // ========================================================================
    console.log("🏪 Creating restaurants...");

    const restaurantData = [
      {
        ownerId: restaurantOwners[0].id,
        name: "Harare Grill House",
        description: "Premium grilled meats and traditional Zimbabwe cuisine with the best BBQ in town",
        address: "123 Main Street, Harare",
        latitude: "-17.8252",
        longitude: "31.0335",
        phoneNumber: "+263 4 123 4567",
        minOrderAmount: 500,
        isApproved: 1,
        isActive: 1,
      },
      {
        ownerId: restaurantOwners[1].id,
        name: "Spice Garden",
        description: "Authentic Indian and Asian fusion cuisine with fresh ingredients and bold flavors",
        address: "456 Park Avenue, Harare",
        latitude: "-17.8300",
        longitude: "31.0400",
        phoneNumber: "+263 4 234 5678",
        minOrderAmount: 400,
        isApproved: 1,
        isActive: 1,
      },
      {
        ownerId: restaurantOwners[2].id,
        name: "Mama Africa Kitchen",
        description: "Authentic Zimbabwean cuisine made with love and traditional recipes",
        address: "45 Samora Machel Ave, Harare",
        latitude: "-17.8292",
        longitude: "31.0522",
        phoneNumber: "+263 771 234 567",
        minOrderAmount: 300,
        isApproved: 1,
        isActive: 1,
      },
      {
        ownerId: restaurantOwners[3].id,
        name: "Pizza Paradise",
        description: "Handcrafted pizzas with fresh ingredients and secret family recipes",
        address: "78 Enterprise Road, Harare",
        latitude: "-17.8200",
        longitude: "31.0200",
        phoneNumber: "+263 4 345 6789",
        minOrderAmount: 350,
        isApproved: 1,
        isActive: 1,
      },
      {
        ownerId: restaurantOwners[4].id,
        name: "Dragon Wok",
        description: "Fast and delicious Chinese cuisine for quick meals",
        address: "92 Fifth Street, Harare",
        latitude: "-17.8150",
        longitude: "31.0100",
        phoneNumber: "+263 4 456 7890",
        minOrderAmount: 400,
        isApproved: 1,
        isActive: 1,
      },
    ];

    for (const rest of restaurantData) {
      await db.insert(schema.restaurants).values(rest).onDuplicateKeyUpdate({
        set: { name: rest.name, isApproved: 1, isActive: 1 }
      });
    }

    console.log("✅ Created 5 restaurants\n");

    // ========================================================================
    // 5. CREATE MENU CATEGORIES AND ITEMS
    // ========================================================================
    const restaurants = await db.select().from(schema.restaurants);
    const grill = restaurants.find((r) => r.name === "Harare Grill House")!;
    const spice = restaurants.find((r) => r.name === "Spice Garden")!;
    const mama = restaurants.find((r) => r.name === "Mama Africa Kitchen")!;
    const pizza = restaurants.find((r) => r.name === "Pizza Paradise")!;
    const dragon = restaurants.find((r) => r.name === "Dragon Wok")!;

    console.log("📂 Creating menu categories...");

    const categories = [
      // Harare Grill House
      { restaurantId: grill.id, name: "Grilled Meats", description: "Premium grilled beef, chicken, and pork", displayOrder: 1 },
      { restaurantId: grill.id, name: "Sides", description: "Vegetables, grains, and traditional sides", displayOrder: 2 },
      { restaurantId: grill.id, name: "Drinks", description: "Beverages and refreshments", displayOrder: 3 },
      // Spice Garden
      { restaurantId: spice.id, name: "Curries", description: "Authentic Indian curries and gravies", displayOrder: 1 },
      { restaurantId: spice.id, name: "Biryani", description: "Aromatic rice dishes", displayOrder: 2 },
      { restaurantId: spice.id, name: "Breads", description: "Fresh Indian breads", displayOrder: 3 },
      { restaurantId: spice.id, name: "Desserts", description: "Sweet treats", displayOrder: 4 },
      // Mama Africa Kitchen
      { restaurantId: mama.id, name: "Traditional Dishes", description: "Authentic Zimbabwean main courses", displayOrder: 1 },
      { restaurantId: mama.id, name: "Grilled Specials", description: "Flame-grilled favorites", displayOrder: 2 },
      { restaurantId: mama.id, name: "Vegetables", description: "Fresh garden vegetables", displayOrder: 3 },
      // Pizza Paradise
      { restaurantId: pizza.id, name: "Classic Pizzas", description: "Traditional pizza favorites", displayOrder: 1 },
      { restaurantId: pizza.id, name: "Specialty Pizzas", description: "Chef's special creations", displayOrder: 2 },
      { restaurantId: pizza.id, name: "Sides", description: "Pizza sides and extras", displayOrder: 3 },
      { restaurantId: pizza.id, name: "Drinks", description: "Beverages", displayOrder: 4 },
      // Dragon Wok
      { restaurantId: dragon.id, name: "Noodles", description: "Stir-fried noodle dishes", displayOrder: 1 },
      { restaurantId: dragon.id, name: "Rice Dishes", description: "Fried rice and rice bowls", displayOrder: 2 },
      { restaurantId: dragon.id, name: "Appetizers", description: "Starters and small plates", displayOrder: 3 },
    ];

    for (const cat of categories) {
      await db.insert(schema.menuCategories).values(cat).onDuplicateKeyUpdate({
        set: { displayOrder: cat.displayOrder },
      });
    }

    console.log("✅ Created menu categories\n");

    // Get category IDs
    const allCats = await db.select().from(schema.menuCategories);
    const getCatId = (restId: number, name: string) => allCats.find(c => c.restaurantId === restId && c.name === name)?.id;

    console.log("🍽️  Creating menu items...");

    const menuItems = [
      // Harare Grill House - Grilled Meats
      { restaurantId: grill.id, categoryId: getCatId(grill.id, "Grilled Meats")!, name: "Grilled Beef Steak", description: "Premium 250g beef steak grilled to perfection", price: 3500, preparationTime: 20 },
      { restaurantId: grill.id, categoryId: getCatId(grill.id, "Grilled Meats")!, name: "Grilled Chicken Quarter", description: "Half chicken marinated and grilled", price: 2500, preparationTime: 15 },
      { restaurantId: grill.id, categoryId: getCatId(grill.id, "Grilled Meats")!, name: "Pork Chops", description: "Two thick-cut pork chops with herbs", price: 2800, preparationTime: 18 },
      { restaurantId: grill.id, categoryId: getCatId(grill.id, "Grilled Meats")!, name: "Mixed Grill Platter", description: "Combination of beef, chicken, and pork", price: 5500, preparationTime: 25 },
      { restaurantId: grill.id, categoryId: getCatId(grill.id, "Grilled Meats")!, name: "Lamb Chops", description: "Tender lamb chops with mint sauce", price: 4000, preparationTime: 22 },
      { restaurantId: grill.id, categoryId: getCatId(grill.id, "Grilled Meats")!, name: "Boerewors Roll", description: "Traditional South African sausage roll", price: 1200, preparationTime: 10 },
      { restaurantId: grill.id, categoryId: getCatId(grill.id, "Grilled Meats")!, name: "Grilled Fish Fillet", description: "Fresh tilapia grilled with lemon butter", price: 3200, preparationTime: 18 },
      { restaurantId: grill.id, categoryId: getCatId(grill.id, "Grilled Meats")!, name: "BBQ Ribs", description: "Slow-grilled pork ribs with BBQ sauce", price: 4200, preparationTime: 30 },
      // Harare Grill House - Sides
      { restaurantId: grill.id, categoryId: getCatId(grill.id, "Sides")!, name: "Chip Chips", description: "Crispy fried potatoes", price: 800, preparationTime: 8 },
      { restaurantId: grill.id, categoryId: getCatId(grill.id, "Sides")!, name: "Coleslaw", description: "Fresh creamy coleslaw", price: 500, preparationTime: 2 },
      { restaurantId: grill.id, categoryId: getCatId(grill.id, "Sides")!, name: "Grilled Vegetables", description: "Seasonal vegetables grilled", price: 700, preparationTime: 10 },
      { restaurantId: grill.id, categoryId: getCatId(grill.id, "Sides")!, name: "Sadza", description: "Traditional maize porridge", price: 400, preparationTime: 5 },
      // Harare Grill House - Drinks
      { restaurantId: grill.id, categoryId: getCatId(grill.id, "Drinks")!, name: "Soft Drink", description: "Assorted soft drinks 330ml", price: 300, preparationTime: 1 },
      { restaurantId: grill.id, categoryId: getCatId(grill.id, "Drinks")!, name: "Fresh Juice", description: "Freshly squeezed juice", price: 600, preparationTime: 3 },
      { restaurantId: grill.id, categoryId: getCatId(grill.id, "Drinks")!, name: "Water", description: "Bottled water 500ml", price: 200, preparationTime: 1 },

      // Spice Garden - Curries
      { restaurantId: spice.id, categoryId: getCatId(spice.id, "Curries")!, name: "Butter Chicken", description: "Creamy tomato-based chicken curry", price: 2800, preparationTime: 20 },
      { restaurantId: spice.id, categoryId: getCatId(spice.id, "Curries")!, name: "Lamb Rogan Josh", description: "Aromatic lamb curry with Kashmiri spices", price: 3500, preparationTime: 25 },
      { restaurantId: spice.id, categoryId: getCatId(spice.id, "Curries")!, name: "Palak Paneer", description: "Creamy spinach curry with cottage cheese", price: 2200, preparationTime: 18 },
      { restaurantId: spice.id, categoryId: getCatId(spice.id, "Curries")!, name: "Chicken Tikka Masala", description: "Grilled chicken in creamy tomato sauce", price: 3000, preparationTime: 20 },
      { restaurantId: spice.id, categoryId: getCatId(spice.id, "Curries")!, name: "Vegetable Korma", description: "Mixed vegetables in mild coconut curry", price: 2000, preparationTime: 15 },
      { restaurantId: spice.id, categoryId: getCatId(spice.id, "Curries")!, name: "Beef Vindaloo", description: "Spicy beef curry with potatoes", price: 3200, preparationTime: 22 },
      // Spice Garden - Biryani
      { restaurantId: spice.id, categoryId: getCatId(spice.id, "Biryani")!, name: "Chicken Biryani", description: "Aromatic rice with spiced chicken", price: 2500, preparationTime: 25 },
      { restaurantId: spice.id, categoryId: getCatId(spice.id, "Biryani")!, name: "Lamb Biryani", description: "Premium basmati rice with tender lamb", price: 3500, preparationTime: 30 },
      { restaurantId: spice.id, categoryId: getCatId(spice.id, "Biryani")!, name: "Vegetable Biryani", description: "Fragrant rice with mixed vegetables", price: 1800, preparationTime: 20 },
      // Spice Garden - Breads
      { restaurantId: spice.id, categoryId: getCatId(spice.id, "Breads")!, name: "Garlic Naan", description: "Soft bread with garlic butter", price: 500, preparationTime: 8 },
      { restaurantId: spice.id, categoryId: getCatId(spice.id, "Breads")!, name: "Butter Naan", description: "Classic butter naan bread", price: 400, preparationTime: 8 },
      { restaurantId: spice.id, categoryId: getCatId(spice.id, "Breads")!, name: "Tandoori Roti", description: "Whole wheat flatbread", price: 300, preparationTime: 6 },
      // Spice Garden - Desserts
      { restaurantId: spice.id, categoryId: getCatId(spice.id, "Desserts")!, name: "Gulab Jamun", description: "Sweet milk dumplings in syrup", price: 600, preparationTime: 5 },
      { restaurantId: spice.id, categoryId: getCatId(spice.id, "Desserts")!, name: "Kheer", description: "Traditional rice pudding", price: 500, preparationTime: 5 },
      { restaurantId: spice.id, categoryId: getCatId(spice.id, "Desserts")!, name: "Rasmalai", description: "Sweet cottage cheese in milk", price: 700, preparationTime: 5 },

      // Mama Africa Kitchen - Traditional Dishes
      { restaurantId: mama.id, categoryId: getCatId(mama.id, "Traditional Dishes")!, name: "Sadza with Beef Stew", description: "Traditional maize porridge with beef stew", price: 1500, preparationTime: 15 },
      { restaurantId: mama.id, categoryId: getCatId(mama.id, "Traditional Dishes")!, name: "Muriwo unedovi", description: "Collard greens with peanut butter", price: 800, preparationTime: 12 },
      { restaurantId: mama.id, categoryId: getCatId(mama.id, "Traditional Dishes")!, name: "Roasted Meat Combo", description: "Various roasted meats with sadza", price: 2800, preparationTime: 20 },
      { restaurantId: mama.id, categoryId: getCatId(mama.id, "Traditional Dishes")!, name: "Kapenta with Sadza", description: "Dried fish with maize porridge", price: 1200, preparationTime: 12 },
      { restaurantId: mama.id, categoryId: getCatId(mama.id, "Traditional Dishes")!, name: "Chicken with Rice", description: "Stewed chicken with yellow rice", price: 1800, preparationTime: 18 },
      // Mama Africa Kitchen - Grilled Specials
      { restaurantId: mama.id, categoryId: getCatId(mama.id, "Grilled Specials")!, name: "Grilled Goat", description: "Tender grilled goat meat", price: 3200, preparationTime: 25 },
      { restaurantId: mama.id, categoryId: getCatId(mama.id, "Grilled Specials")!, name: "Grilled Chicken", description: "Whole grilled village chicken", price: 2500, preparationTime: 30 },
      // Mama Africa Kitchen - Vegetables
      { restaurantId: mama.id, categoryId: getCatId(mama.id, "Vegetables")!, name: "Ifius", description: "Fried corn fritters", price: 400, preparationTime: 8 },
      { restaurantId: mama.id, categoryId: getCatId(mama.id, "Vegetables")!, name: "Sweet Potato", description: "Boiled or roasted sweet potato", price: 500, preparationTime: 10 },

      // Pizza Paradise - Classic Pizzas
      { restaurantId: pizza.id, categoryId: getCatId(pizza.id, "Classic Pizzas")!, name: "Margherita", description: "Tomato sauce, mozzarella, basil", price: 1800, preparationTime: 15 },
      { restaurantId: pizza.id, categoryId: getCatId(pizza.id, "Classic Pizzas")!, name: "Pepperoni", description: "Tomato sauce, mozzarella, pepperoni", price: 2200, preparationTime: 15 },
      { restaurantId: pizza.id, categoryId: getCatId(pizza.id, "Classic Pizzas")!, name: "Hawaiian", description: "Ham, pineapple, mozzarella", price: 2000, preparationTime: 15 },
      { restaurantId: pizza.id, categoryId: getCatId(pizza.id, "Classic Pizzas")!, name: "BBQ Chicken", description: "BBQ sauce, chicken, red onions", price: 2400, preparationTime: 15 },
      // Pizza Paradise - Specialty Pizzas
      { restaurantId: pizza.id, categoryId: getCatId(pizza.id, "Specialty Pizzas")!, name: "Meat Lovers", description: "Pepperoni, sausage, bacon, ham", price: 3200, preparationTime: 18 },
      { restaurantId: pizza.id, categoryId: getCatId(pizza.id, "Specialty Pizzas")!, name: "Veggie Supreme", description: "Bell peppers, onions, mushrooms, olives", price: 2500, preparationTime: 18 },
      { restaurantId: pizza.id, categoryId: getCatId(pizza.id, "Specialty Pizzas")!, name: "Four Cheese", description: "Mozzarella, gorgonzola, parmesan, feta", price: 2800, preparationTime: 18 },
      { restaurantId: pizza.id, categoryId: getCatId(pizza.id, "Specialty Pizzas")!, name: "ZimBites Special", description: "Our signature pizza with local flavors", price: 3000, preparationTime: 18 },
      // Pizza Paradise - Sides
      { restaurantId: pizza.id, categoryId: getCatId(pizza.id, "Sides")!, name: "Garlic Bread", description: "Crusty bread with garlic butter", price: 600, preparationTime: 8 },
      { restaurantId: pizza.id, categoryId: getCatId(pizza.id, "Sides")!, name: "Chicken Wings", description: "Crispy buffalo wings", price: 1200, preparationTime: 12 },
      // Pizza Paradise - Drinks
      { restaurantId: pizza.id, categoryId: getCatId(pizza.id, "Drinks")!, name: "Soft Drink", description: "Assorted soft drinks", price: 300, preparationTime: 1 },
      { restaurantId: pizza.id, categoryId: getCatId(pizza.id, "Drinks")!, name: "Juice", description: "Fresh fruit juice", price: 500, preparationTime: 1 },

      // Dragon Wok - Noodles
      { restaurantId: dragon.id, categoryId: getCatId(dragon.id, "Noodles")!, name: "Chicken Chow Mein", description: "Stir-fried noodles with chicken", price: 1800, preparationTime: 12 },
      { restaurantId: dragon.id, categoryId: getCatId(dragon.id, "Noodles")!, name: "Beef Noodles", description: "Noodles with tender beef strips", price: 2200, preparationTime: 12 },
      { restaurantId: dragon.id, categoryId: getCatId(dragon.id, "Noodles")!, name: "Vegetable Lo Mein", description: "Noodles with mixed vegetables", price: 1400, preparationTime: 10 },
      { restaurantId: dragon.id, categoryId: getCatId(dragon.id, "Noodles")!, name: "Seafood Noodles", description: "Noodles with shrimp and squid", price: 2800, preparationTime: 15 },
      // Dragon Wok - Rice Dishes
      { restaurantId: dragon.id, categoryId: getCatId(dragon.id, "Rice Dishes")!, name: "Chicken Fried Rice", description: "Classic fried rice with chicken", price: 1600, preparationTime: 10 },
      { restaurantId: dragon.id, categoryId: getCatId(dragon.id, "Rice Dishes")!, name: "Beef Fried Rice", description: "Fried rice with beef", price: 2000, preparationTime: 12 },
      { restaurantId: dragon.id, categoryId: getCatId(dragon.id, "Rice Dishes")!, name: "Yangzhou Fried Rice", description: "Special fried rice with multiple ingredients", price: 2200, preparationTime: 12 },
      // Dragon Wok - Appetizers
      { restaurantId: dragon.id, categoryId: getCatId(dragon.id, "Appetizers")!, name: "Spring Rolls", description: "Crispy vegetable spring rolls (4 pcs)", price: 600, preparationTime: 8 },
      { restaurantId: dragon.id, categoryId: getCatId(dragon.id, "Appetizers")!, name: "Dumplings", description: "Steamed pork dumplings (6 pcs)", price: 800, preparationTime: 10 },
      { restaurantId: dragon.id, categoryId: getCatId(dragon.id, "Appetizers")!, name: "Wonton Soup", description: "Clear soup with wontons", price: 700, preparationTime: 8 },
    ];

    for (const item of menuItems) {
      await db.insert(schema.menuItems).values(item).onDuplicateKeyUpdate({
        set: { price: item.price }
      });
    }

    console.log("✅ Created 50+ menu items\n");

    // ========================================================================
    // 6. CREATE DRIVER WALLETS
    // ========================================================================
    console.log("💰 Creating driver wallets...");

    const allDrivers = await db.select().from(schema.drivers);
    for (const driver of allDrivers) {
      const earnings = driver.totalDeliveries * 200; // Approximate earnings
      await db.insert(schema.driverWallets).values({
        driverId: driver.id,
        availableBalance: Math.floor(earnings * 0.7),
        pendingEarnings: Math.floor(earnings * 0.1),
        totalEarnings: earnings,
        totalTips: Math.floor(earnings * 0.2),
      }).onDuplicateKeyUpdate({
        set: { availableBalance: Math.floor(earnings * 0.7) }
      });
    }

    console.log("✅ Created driver wallets\n");

    // ========================================================================
    // 7. CREATE PLATFORM SETTINGS
    // ========================================================================
    console.log("⚙️  Creating platform settings...");

    const settings = [
      { settingKey: "commission_percentage", settingValue: JSON.stringify({ value: 10 }), description: "Platform commission percentage" },
      { settingKey: "delivery_fee_base", settingValue: JSON.stringify({ value: 500 }), description: "Base delivery fee in cents" },
      { settingKey: "minimum_order_amount", settingValue: JSON.stringify({ value: 200 }), description: "Minimum order amount in cents" },
      { settingKey: "max_delivery_radius", settingValue: JSON.stringify({ value: 15 }), description: "Maximum delivery radius in km" },
      { settingKey: "driver_earning_percentage", settingValue: JSON.stringify({ value: 80 }), description: "Percentage of delivery fee for drivers" },
    ];

    for (const setting of settings) {
      await db.insert(schema.platformSettings).values(setting).onDuplicateKeyUpdate({
        set: { settingValue: setting.settingValue }
      });
    }

    console.log("✅ Created platform settings\n");

    // ========================================================================
    // 8. CREATE SAMPLE ORDERS
    // ========================================================================
    console.log("📦 Creating sample orders...");

    const customers = users.filter(u => u.role === "customer");
    const approvedDrivers = allDrivers.filter(d => d.isApproved === 1);

    const sampleOrders = [
      { customerIdx: 0, restaurantIdx: 0, status: "delivered" as const, total: 4200 },
      { customerIdx: 1, restaurantIdx: 1, status: "delivered" as const, total: 5500 },
      { customerIdx: 2, restaurantIdx: 2, status: "delivered" as const, total: 2800 },
      { customerIdx: 3, restaurantIdx: 3, status: "customer_confirmed" as const, total: 3500 },
      { customerIdx: 4, restaurantIdx: 4, status: "out_for_delivery" as const, total: 2600 },
      { customerIdx: 5, restaurantIdx: 0, status: "preparing" as const, total: 3100 },
      { customerIdx: 6, restaurantIdx: 1, status: "accepted" as const, total: 4800 },
      { customerIdx: 7, restaurantIdx: 2, status: "pending" as const, total: 2200 },
      { customerIdx: 8, restaurantIdx: 3, status: "ready_for_pickup" as const, total: 2900 },
      { customerIdx: 9, restaurantIdx: 4, status: "pending" as const, total: 3400 },
    ];

    for (let i = 0; i < sampleOrders.length; i++) {
      const order = sampleOrders[i];
      const customer = customers[order.customerIdx];
      const restaurant = restaurants[order.restaurantIdx];
      const orderNumber = `ORD-${Date.now()}-${i.toString().padStart(4, '0')}`;
      
      const driverId = ["delivered", "customer_confirmed", "out_for_delivery"].includes(order.status) 
        ? approvedDrivers[i % approvedDrivers.length].id 
        : null;

      await db.insert(schema.orders).values({
        customerId: customer.id,
        restaurantId: restaurant.id,
        driverId,
        orderNumber,
        status: order.status,
        deliveryAddress: `${100 + i * 10} Sample Street, Harare`,
        subtotal: Math.floor(order.total * 0.8),
        deliveryFee: 500,
        tax: 0,
        discount: 0,
        platformCommission: Math.floor(order.total * 0.1),
        tip: 0,
        total: order.total,
        paymentMethod: "cash",
        paymentStatus: order.status === "delivered" || order.status === "customer_confirmed" ? "completed" : "pending",
      });

      // Add status history
      await db.insert(schema.orderStatusHistory).values({
        orderId: i + 1,
        status: "pending",
        notes: "Order placed",
        createdBy: customer.id,
      });

      if (order.status !== "pending") {
        await db.insert(schema.orderStatusHistory).values({
          orderId: i + 1,
          status: "accepted",
          notes: "Order accepted",
          createdBy: restaurant.ownerId,
        });
      }
    }

    console.log("✅ Created sample orders\n");

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✨ ZimBites seeding complete!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n📋 Demo Accounts:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Admin:      admin@zimbites.com");
    console.log("Restaurant: marcus@zimbites.com");
    console.log("Driver:     david.driver@zimbites.com");
    console.log("Customer:   john@example.com");
    console.log("\n⚠️  Password for all demo accounts: ChangeMe123!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

seedDatabase();
