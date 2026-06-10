const mysql = require('mysql2/promise');

async function seed() {
  const connection = await mysql.createConnection({
    host: 'gateway01.us-east-1.prod.aws.tidbcloud.com',
    port: 4000,
    user: '4V16oiuF4Ax9FhA.root',
    password: 'fZSBKYlW97e6vjKS',
    database: 'test',
    ssl: { rejectUnauthorized: true }
  });

  console.log('Connected to TiDB');

  // Create demo users (using openId for auth)
  const users = [
    { name: 'Admin User', email: 'admin@zimbites.com', role: 'admin', openId: 'admin_demo_001' },
    { name: 'Restaurant Owner', email: 'restaurant@zimbites.com', role: 'restaurant', openId: 'restaurant_demo_001' },
    { name: 'Delivery Driver', email: 'driver@zimbites.com', role: 'driver', openId: 'driver_demo_001' },
    { name: 'Test Customer', email: 'customer@zimbites.com', role: 'customer', openId: 'customer_demo_001' },
  ];

  console.log('\n--- Creating Users ---');
  for (const user of users) {
    try {
      const [result] = await connection.execute(
        'INSERT INTO users (name, email, role, openId, loginMethod) VALUES (?, ?, ?, ?, ?)',
        [user.name, user.email, user.role, user.openId, 'demo']
      );
      user.id = result.insertId;
      console.log(`✓ Created user: ${user.email} (ID: ${user.id})`);
    } catch (err) {
      if (err.message.includes('Duplicate')) {
        const [rows] = await connection.execute('SELECT id FROM users WHERE email = ?', [user.email]);
        user.id = rows[0].id;
        console.log(`✓ User exists: ${user.email} (ID: ${user.id})`);
      } else {
        console.error(`Error creating user ${user.email}:`, err.message);
      }
    }
  }

  // Create restaurant
  console.log('\n--- Creating Restaurant ---');
  let restaurantId;
  try {
    const [result] = await connection.execute(
      `INSERT INTO restaurants (ownerId, name, description, address, phoneNumber, isActive, isApproved) 
       VALUES (?, ?, ?, ?, ?, 1, 1)`,
      [users[1].id, 'The Great Kitchen', 'Best local cuisine in town', '123 Main Street, Harare', '+263771234567']
    );
    restaurantId = result.insertId;
    console.log(`✓ Created restaurant: The Great Kitchen (ID: ${restaurantId})`);
  } catch (err) {
    if (err.message.includes('Duplicate')) {
      const [rows] = await connection.execute('SELECT id FROM restaurants WHERE name = ?', ['The Great Kitchen']);
      restaurantId = rows[0]?.id;
      console.log(`✓ Restaurant exists: The Great Kitchen (ID: ${restaurantId})`);
    } else {
      console.error('Error:', err.message);
    }
  }

  // Create menu categories
  console.log('\n--- Creating Menu ---');
  const categories = [
    { name: 'Starters', items: [
      { name: 'Crispy Calamari', price: 850 },
      { name: 'Bruschetta', price: 550 },
      { name: 'Spring Rolls', price: 650 }
    ]},
    { name: 'Main Course', items: [
      { name: 'Grilled Steak', price: 2500 },
      { name: 'Chicken Curry', price: 1800 },
      { name: 'Vegetable Stir Fry', price: 1200 }
    ]},
    { name: 'Drinks', items: [
      { name: 'Fresh Juice', price: 400 },
      { name: 'Soda', price: 200 },
      { name: 'Water', price: 150 }
    ]},
  ];

  const menuItemIds = [];
  for (const cat of categories) {
    try {
      const [catResult] = await connection.execute(
        'INSERT INTO menuCategories (restaurantId, name) VALUES (?, ?)',
        [restaurantId, cat.name]
      );
      const categoryId = catResult.insertId;
      console.log(`✓ Category: ${cat.name}`);

      for (const item of cat.items) {
        try {
          const [itemResult] = await connection.execute(
            'INSERT INTO menuItems (restaurantId, categoryId, name, price) VALUES (?, ?, ?, ?)',
            [restaurantId, categoryId, item.name, item.price]
          );
          menuItemIds.push({ id: itemResult.insertId, ...item });
          console.log(`  ✓ ${item.name} - ZWL ${item.price/100}`);
        } catch (err) {
          if (!err.message.includes('Duplicate')) console.error(`  Error: ${err.message}`);
        }
      }
    } catch (err) {
      console.error(`Error: ${err.message}`);
    }
  }

  // Create driver profile
  console.log('\n--- Creating Driver Profile ---');
  try {
    await connection.execute(
      `INSERT INTO drivers (userId, phoneNumber, vehicleType, status) VALUES (?, ?, ?, 'available')`,
      [users[2].id, '+263779876543', 'motorcycle']
    );
    const [rows] = await connection.execute('SELECT LAST_INSERT_ID() as id');
    const driverId = rows[0].id;
    console.log(`✓ Driver profile created (ID: ${driverId})`);
    
    // Create wallet
    await connection.execute(
      'INSERT INTO driverWallets (driverId, balance) VALUES (?, 0)',
      [driverId]
    );
    console.log(`✓ Driver wallet created`);
  } catch (err) {
    if (err.message.includes('Duplicate')) {
      console.log(`✓ Driver profile already exists`);
    } else {
      console.error('Error:', err.message);
    }
  }

  console.log('\n========================================');
  console.log('=== ZIMBITES SEED COMPLETE ===');
  console.log('========================================');
  console.log('\nDemo accounts (use these with demo login):');
  console.log('  admin@zimbites.com (Admin)');
  console.log('  restaurant@zimbites.com (Restaurant)');
  console.log('  driver@zimbites.com (Driver)');
  console.log('  customer@zimbites.com (Customer)');
  console.log('\nPassword for all: ChangeMe123!');
  console.log(`\nRestaurant ID: ${restaurantId}`);
  console.log(`Menu Item IDs: ${menuItemIds.map(i => i.id).join(', ')}`);

  await connection.end();
  
  // Return data for testing
  return { users, restaurantId, menuItemIds };
}

seed().catch(console.error);