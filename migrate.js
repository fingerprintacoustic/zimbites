const mysql = require('mysql2/promise');

async function migrate() {
  const connection = await mysql.createConnection({
    host: 'gateway01.us-east-1.prod.aws.tidbcloud.com',
    port: 4000,
    user: '4V16oiuF4Ax9FhA.root',
    password: 'fZSBKYlW97e6vjKS',
    database: 'test',
    ssl: { rejectUnauthorized: true }
  });

  console.log('Connected to TiDB');

  // Create tables
  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      role ENUM('customer', 'restaurant', 'driver', 'admin') DEFAULT 'customer',
      image VARCHAR(500),
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS restaurants (
      id INT AUTO_INCREMENT PRIMARY KEY,
      ownerId INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      phone VARCHAR(50),
      email VARCHAR(255),
      logo VARCHAR(500),
      banner VARCHAR(500),
      address VARCHAR(500),
      latitude DECIMAL(10, 8),
      longitude DECIMAL(11, 8),
      isOpen BOOLEAN DEFAULT true,
      status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (ownerId) REFERENCES users(id)
    )`,
    `CREATE TABLE IF NOT EXISTS menu_categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      restaurantId INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      displayOrder INT DEFAULT 0,
      isActive BOOLEAN DEFAULT true,
      FOREIGN KEY (restaurantId) REFERENCES restaurants(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS menu_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      restaurantId INT NOT NULL,
      categoryId INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      price INT NOT NULL,
      image VARCHAR(500),
      isAvailable BOOLEAN DEFAULT true,
      preparationTime INT DEFAULT 15,
      FOREIGN KEY (restaurantId) REFERENCES restaurants(id) ON DELETE CASCADE,
      FOREIGN KEY (categoryId) REFERENCES menu_categories(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS carts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      customerId INT NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customerId) REFERENCES users(id)
    )`,
    `CREATE TABLE IF NOT EXISTS cart_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      cartId INT NOT NULL,
      menuItemId INT NOT NULL,
      quantity INT DEFAULT 1,
      price INT NOT NULL,
      FOREIGN KEY (cartId) REFERENCES carts(id) ON DELETE CASCADE,
      FOREIGN KEY (menuItemId) REFERENCES menu_items(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      orderNumber VARCHAR(50) UNIQUE NOT NULL,
      customerId INT NOT NULL,
      restaurantId INT NOT NULL,
      driverId INT,
      subtotal INT NOT NULL DEFAULT 0,
      deliveryFee INT NOT NULL DEFAULT 0,
      tax INT NOT NULL DEFAULT 0,
      discount INT NOT NULL DEFAULT 0,
      total INT NOT NULL DEFAULT 0,
      status ENUM('pending', 'accepted', 'preparing', 'ready_for_pickup', 'driver_assigned', 'picked_up', 'out_for_delivery', 'delivered', 'customer_confirmed', 'cancelled', 'rejected', 'refunded') DEFAULT 'pending',
      deliveryAddress VARCHAR(500) NOT NULL,
      deliveryNotes VARCHAR(500),
      estimatedDeliveryTime TIMESTAMP,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (customerId) REFERENCES users(id),
      FOREIGN KEY (restaurantId) REFERENCES restaurants(id),
      FOREIGN KEY (driverId) REFERENCES users(id)
    )`,
    `CREATE TABLE IF NOT EXISTS order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      orderId INT NOT NULL,
      menuItemId INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      quantity INT NOT NULL,
      price INT NOT NULL,
      total INT NOT NULL,
      FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (menuItemId) REFERENCES menu_items(id)
    )`,
    `CREATE TABLE IF NOT EXISTS drivers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL UNIQUE,
      phoneNumber VARCHAR(50),
      vehicleType ENUM('motorcycle', 'car', 'bicycle') DEFAULT 'motorcycle',
      licensePlate VARCHAR(50),
      status ENUM('available', 'on_delivery', 'offline') DEFAULT 'offline',
      totalDeliveries INT DEFAULT 0,
      totalEarnings INT DEFAULT 0,
      currentLatitude DECIMAL(10, 8),
      currentLongitude DECIMAL(11, 8),
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    )`,
    `CREATE TABLE IF NOT EXISTS driver_assignments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      orderId INT NOT NULL,
      driverId INT NOT NULL,
      status ENUM('pending', 'accepted', 'rejected', 'completed') DEFAULT 'pending',
      assignedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      acceptedAt TIMESTAMP,
      pickedUpAt TIMESTAMP,
      deliveredAt TIMESTAMP,
      FOREIGN KEY (orderId) REFERENCES orders(id),
      FOREIGN KEY (driverId) REFERENCES drivers(id)
    )`,
    `CREATE TABLE IF NOT EXISTS order_status_history (
      id INT AUTO_INCREMENT PRIMARY KEY,
      orderId INT NOT NULL,
      status VARCHAR(50) NOT NULL,
      notes TEXT,
      createdBy INT,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (createdBy) REFERENCES users(id)
    )`,
    `CREATE TABLE IF NOT EXISTS notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      isRead BOOLEAN DEFAULT false,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    )`,
    `CREATE TABLE IF NOT EXISTS payments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      orderId INT NOT NULL,
      amount INT NOT NULL,
      method ENUM('cash_on_delivery', 'card', 'mobile_money') DEFAULT 'cash_on_delivery',
      status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
      reference VARCHAR(255),
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (orderId) REFERENCES orders(id)
    )`,
    `CREATE TABLE IF NOT EXISTS ratings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      orderId INT NOT NULL,
      customerId INT NOT NULL,
      restaurantId INT NOT NULL,
      driverId INT,
      foodRating INT CHECK (foodRating >= 1 AND foodRating <= 5),
      deliveryRating INT CHECK (deliveryRating >= 1 AND deliveryRating <= 5),
      comment TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (orderId) REFERENCES orders(id),
      FOREIGN KEY (customerId) REFERENCES users(id),
      FOREIGN KEY (restaurantId) REFERENCES restaurants(id),
      FOREIGN KEY (driverId) REFERENCES users(id)
    )`,
    `CREATE TABLE IF NOT EXISTS tips (
      id INT AUTO_INCREMENT PRIMARY KEY,
      orderId INT NOT NULL,
      driverId INT NOT NULL,
      amount INT NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (orderId) REFERENCES orders(id),
      FOREIGN KEY (driverId) REFERENCES drivers(id)
    )`,
    `CREATE TABLE IF NOT EXISTS driver_wallets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      driverId INT NOT NULL UNIQUE,
      balance INT DEFAULT 0,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (driverId) REFERENCES drivers(id)
    )`,
    `CREATE TABLE IF NOT EXISTS platform_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      key VARCHAR(100) UNIQUE NOT NULL,
      value TEXT,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`
  ];

  for (const sql of tables) {
    try {
      await connection.execute(sql);
      console.log('✓ Created table');
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('✓ Table already exists');
      } else {
        console.error('Error:', err.message);
      }
    }
  }

  await connection.end();
  console.log('\nMigration complete!');
}

migrate().catch(console.error);