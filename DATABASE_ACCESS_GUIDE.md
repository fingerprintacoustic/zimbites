# Zimbites Database Access Guide

Complete guide to access, manage, and populate your Zimbites database with demo accounts and test data.

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Access Methods](#access-methods)
3. [Demo Test Accounts](#demo-test-accounts)
4. [Seed Data](#seed-data)
5. [Database Schema](#database-schema)
6. [Common Tasks](#common-tasks)
7. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### Step 1: Access the Management UI

1. Go to your Manus project dashboard
2. Click on the **"Database"** tab in the left sidebar
3. You'll see your database connection information

### Step 2: View Connection Details

In the Database panel, you'll find:
- **Host**: Database server address
- **Port**: Connection port (usually 3306)
- **Username**: Database user
- **Password**: Database password
- **Database Name**: Your database name
- **Connection String**: Full connection URL

### Step 3: Connect Using Your Preferred Tool

Choose one of the access methods below and connect using the credentials from Step 2.

---

## 🔌 Access Methods

### Method 1: Manus Management UI (Easiest)

**Best for**: Quick viewing and editing without external tools

**Steps**:
1. Open your project in Manus
2. Click "Database" tab
3. Use the built-in CRUD interface to:
   - View all tables
   - Add new records
   - Edit existing records
   - Delete records

**Advantages**:
- No setup required
- Visual interface
- Built-in security
- No external tools needed

---

### Method 2: MySQL Workbench

**Best for**: Advanced database management and complex queries

**Installation**:
```bash
# macOS
brew install mysql-workbench

# Windows
# Download from https://www.mysql.com/products/workbench/

# Linux
sudo apt-get install mysql-workbench
```

**Connection Steps**:
1. Open MySQL Workbench
2. Click "+" next to "MySQL Connections"
3. Fill in:
   - **Connection Name**: Zimbites
   - **Hostname**: (from Database panel)
   - **Port**: 3306
   - **Username**: (from Database panel)
   - **Password**: (from Database panel)
4. Click "Test Connection"
5. Click "OK"

---

### Method 3: DBeaver (Universal Database Tool)

**Best for**: Works with any database type

**Installation**:
```bash
# macOS
brew install dbeaver-community

# Windows
# Download from https://dbeaver.io/download/

# Linux
sudo apt-get install dbeaver-community
```

**Connection Steps**:
1. Click "File" → "New Database Connection"
2. Select "MySQL"
3. Click "Next"
4. Fill in connection details from Database panel
5. Click "Finish"

---

### Method 4: TablePlus (Modern UI)

**Best for**: Beautiful, modern interface

**Installation**:
```bash
# macOS
brew install tableplus

# Windows/Linux
# Download from https://tableplus.com/
```

**Connection Steps**:
1. Click "Create..." button
2. Select "MySQL"
3. Fill in connection details
4. Click "Connect"

---

### Method 5: Command Line (mysql-cli)

**Best for**: Scripting and automation

**Installation**:
```bash
# macOS
brew install mysql-client

# Ubuntu/Debian
sudo apt-get install mysql-client

# Windows
# Download from https://dev.mysql.com/downloads/mysql/
```

**Connection**:
```bash
mysql -h HOST -u USERNAME -p DATABASE_NAME
# Then enter password when prompted
```

**Example**:
```bash
mysql -h db.example.com -u zimbites_user -p zimbites_db
```

---

## 👥 Demo Test Accounts

### Account Credentials

All demo accounts use the same password system. They're identified by their `openId`:

| Role | OpenID | Name | Email | Purpose |
|------|--------|------|-------|---------|
| **Admin** | `admin-demo-001` | Admin User | admin@zimbites.local | Platform management |
| **Customer 1** | `customer-demo-001` | John Doe | john@zimbites.local | Test ordering |
| **Customer 2** | `customer-demo-002` | Jane Smith | jane@zimbites.local | Test ordering |
| **Restaurant 1** | `restaurant-demo-001` | Chef Marcus | marcus@zimbites.local | Menu management |
| **Restaurant 2** | `restaurant-demo-002` | Chef Patricia | patricia@zimbites.local | Menu management |
| **Driver 1** | `driver-demo-001` | David Johnson | david@zimbites.local | Delivery management |
| **Driver 2** | `driver-demo-002` | Sarah Williams | sarah@zimbites.local | Delivery management |

### How to Use Demo Accounts

1. **Go to**: https://zimbitesfd-ueegtxu7.manus.space
2. **Click**: "Get Started"
3. **Sign in** with your OAuth provider
4. **Your role** is determined by your user record in the database

### Changing Your Role

To test different roles, you need to update your user record in the database:

**SQL Query**:
```sql
UPDATE users 
SET role = 'admin' 
WHERE openId = 'your-open-id-here';
```

**Replace** `your-open-id-here` with your actual OpenID from your OAuth provider.

---

## 🌱 Seed Data

### What's Included

The seed data includes:

- **7 User Accounts** (1 admin, 2 customers, 2 restaurants, 2 drivers)
- **2 Restaurants** with full details and contact info
- **6 Menu Categories** (Grilled Meats, Sides, Beverages, Curries, Noodles & Rice, Appetizers)
- **15 Menu Items** with prices and descriptions
- **2 Driver Wallets** with earnings
- **4 Platform Settings** (commission, delivery fee, radius, min order)

### Restaurants Included

#### 1. Harare Grill House
- **Owner**: Chef Marcus
- **Address**: 123 Main Street, Harare
- **Specialty**: Premium grilled meats and traditional Zimbabwe cuisine
- **Min Order**: ZWL 500
- **Delivery Fee**: ZWL 250
- **Menu Items**: 7 items (steaks, chicken, sides, beverages)

#### 2. Spice Garden
- **Owner**: Chef Patricia
- **Address**: 456 Park Avenue, Harare
- **Specialty**: Indian and Asian fusion cuisine
- **Min Order**: ZWL 400
- **Delivery Fee**: ZWL 200
- **Menu Items**: 8 items (curries, noodles, appetizers)

### How to Populate Seed Data

#### Option 1: Using the SQL Script (Recommended)

1. **Download the seed script**:
   - File: `/home/ubuntu/zimbites/scripts/seed-data.sql`

2. **Access your database** using one of the methods above

3. **Run the SQL script**:
   - In MySQL Workbench: File → Open SQL Script → Select seed-data.sql → Execute
   - In DBeaver: File → Open SQL Script → Select seed-data.sql → Execute
   - In CLI: `mysql -h HOST -u USER -p DB_NAME < seed-data.sql`

4. **Verify the data**:
   ```sql
   SELECT COUNT(*) FROM users;
   SELECT COUNT(*) FROM restaurants;
   SELECT COUNT(*) FROM menu_items;
   ```

#### Option 2: Manual SQL Queries

Copy and paste the SQL queries from the sections below into your database client.

---

## 🗄️ Database Schema

### Users Table

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  openId VARCHAR(64) UNIQUE NOT NULL,
  name TEXT,
  email VARCHAR(320),
  loginMethod VARCHAR(64),
  role ENUM('customer', 'restaurant', 'driver', 'admin') DEFAULT 'customer',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  lastSignedIn TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Restaurants Table

```sql
CREATE TABLE restaurants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ownerId INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  address VARCHAR(500),
  latitude VARCHAR(20),
  longitude VARCHAR(20),
  phoneNumber VARCHAR(20),
  minOrderAmount INT DEFAULT 500,
  deliveryFee INT DEFAULT 250,
  commissionPercentage INT DEFAULT 10,
  isApproved BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (ownerId) REFERENCES users(id)
);
```

### Menu Items Table

```sql
CREATE TABLE menu_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  categoryId INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price INT NOT NULL,
  isAvailable BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (categoryId) REFERENCES menu_categories(id)
);
```

### Orders Table

```sql
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customerId INT NOT NULL,
  restaurantId INT NOT NULL,
  driverId INT,
  status ENUM('pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'delivered', 'cancelled') DEFAULT 'pending',
  deliveryAddress VARCHAR(500),
  subtotal INT,
  deliveryFee INT,
  platformCommission INT,
  tip INT DEFAULT 0,
  totalAmount INT,
  paymentMethod VARCHAR(50),
  paymentStatus ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customerId) REFERENCES users(id),
  FOREIGN KEY (restaurantId) REFERENCES restaurants(id),
  FOREIGN KEY (driverId) REFERENCES users(id)
);
```

### Driver Wallets Table

```sql
CREATE TABLE driver_wallets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  driverId INT NOT NULL UNIQUE,
  balance INT DEFAULT 0,
  totalEarnings INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (driverId) REFERENCES users(id)
);
```

### Platform Settings Table

```sql
CREATE TABLE platform_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## 🛠️ Common Tasks

### Task 1: Change User Role

**Scenario**: You want to test as an admin

**SQL Query**:
```sql
UPDATE users 
SET role = 'admin' 
WHERE openId = 'your-open-id-here';
```

**Then refresh** your browser to see the admin dashboard link.

---

### Task 2: View All Users

**SQL Query**:
```sql
SELECT id, name, email, role, createdAt 
FROM users 
ORDER BY createdAt DESC;
```

---

### Task 3: View All Restaurants

**SQL Query**:
```sql
SELECT r.id, r.name, u.name as owner, r.address, r.isApproved 
FROM restaurants r 
JOIN users u ON r.ownerId = u.id;
```

---

### Task 4: View Menu Items for a Restaurant

**SQL Query**:
```sql
SELECT mi.id, mi.name, mi.price, mc.name as category
FROM menu_items mi
JOIN menu_categories mc ON mi.categoryId = mc.id
WHERE mc.restaurantId = 1;
```

---

### Task 5: View All Orders

**SQL Query**:
```sql
SELECT o.id, u.name as customer, r.name as restaurant, o.status, o.totalAmount, o.createdAt
FROM orders o
JOIN users u ON o.customerId = u.id
JOIN restaurants r ON o.restaurantId = r.id
ORDER BY o.createdAt DESC;
```

---

### Task 6: Add a New Restaurant

**SQL Query**:
```sql
INSERT INTO restaurants (ownerId, name, description, address, latitude, longitude, phoneNumber, minOrderAmount, deliveryFee, isApproved)
VALUES (
  2,  -- Replace with restaurant owner user ID
  'Your Restaurant Name',
  'Your restaurant description',
  'Your address',
  '-17.8252',
  '31.0335',
  '+263 4 123 4567',
  500,
  250,
  1
);
```

---

### Task 7: Update Platform Commission

**SQL Query**:
```sql
UPDATE platform_settings 
SET value = '15' 
WHERE key = 'platform_commission_percentage';
```

---

### Task 8: View Driver Earnings

**SQL Query**:
```sql
SELECT u.name, dw.balance, dw.totalEarnings
FROM driver_wallets dw
JOIN users u ON dw.driverId = u.id;
```

---

### Task 9: Create a Test Order

**SQL Query**:
```sql
INSERT INTO orders (customerId, restaurantId, status, deliveryAddress, subtotal, deliveryFee, platformCommission, tip, totalAmount, paymentMethod, paymentStatus)
VALUES (
  1,  -- Customer ID
  1,  -- Restaurant ID
  'pending',
  '123 Customer Street, Harare',
  5000,
  250,
  500,
  200,
  5950,
  'ecocash',
  'pending'
);
```

---

### Task 10: Approve a Restaurant

**SQL Query**:
```sql
UPDATE restaurants 
SET isApproved = 1 
WHERE id = 1;
```

---

## 🔍 Troubleshooting

### Issue: Cannot Connect to Database

**Possible Causes**:
1. Wrong host/port
2. Wrong username/password
3. Network connectivity issue
4. Database not running

**Solutions**:
1. Verify credentials in Manus Database panel
2. Check your network connection
3. Try connecting from a different machine
4. Contact Manus support if database is down

---

### Issue: "Access Denied" Error

**Possible Causes**:
1. Wrong password
2. User doesn't have permission
3. User doesn't exist

**Solutions**:
1. Double-check password (copy-paste from Database panel)
2. Verify username matches exactly
3. Check if user has SELECT, INSERT, UPDATE permissions

---

### Issue: Cannot See Data After Inserting

**Possible Causes**:
1. Query didn't execute
2. Transaction not committed
3. Wrong database selected

**Solutions**:
1. Check for SQL errors in the client
2. Make sure to commit transactions
3. Verify you're connected to the correct database

---

### Issue: Role Change Not Showing in App

**Possible Causes**:
1. Browser cache
2. Session not refreshed
3. Wrong openId updated

**Solutions**:
1. Clear browser cache and cookies
2. Log out and log back in
3. Verify you updated the correct user record

---

## 📞 Support

If you need help:

1. **Check the logs**: Look at `.manus-logs/` directory in your project
2. **Review the schema**: Compare your data with the schema above
3. **Test with SQL**: Run SELECT queries to verify data exists
4. **Contact support**: Reach out to Manus support team

---

## 📚 Additional Resources

- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Zimbites API Documentation](./DOCUMENTATION.md)
- [Zimbites Deployment Guide](./DEPLOYMENT_GUIDE.md)

---

**Last Updated**: June 2026
**Version**: 1.0
