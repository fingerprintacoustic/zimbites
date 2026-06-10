# Zimbites - Complete Food Delivery Platform Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [API Documentation](#api-documentation)
5. [Frontend Implementation](#frontend-implementation)
6. [Deployment Guide](#deployment-guide)
7. [Flutter Apps](#flutter-apps)
8. [Firebase Integration](#firebase-integration)

---

## Project Overview

**Zimbites** is a production-ready food delivery platform optimized for Zimbabwe, featuring customer mobile and web apps, restaurant management portal, driver allocation system, and comprehensive admin dashboard. The platform supports local payment methods including EcoCash, InnBucks, OneMoney, Omari, and bank transfers.

### Key Features

- **Customer App**: Browse restaurants, search menus, place orders, track deliveries, rate restaurants and drivers
- **Restaurant Portal**: Manage menus, accept/reject orders, update preparation status, view analytics
- **Driver Dashboard**: View assigned deliveries, update status, track earnings and tips
- **Admin Dashboard**: Manage restaurants, drivers, users, configure platform fees, view reports
- **Payment Integration**: Multiple Zimbabwe payment methods with reference confirmation flow
- **Real-time Tracking**: Live driver location and order status updates
- **Ratings System**: Customer ratings for restaurants and drivers
- **Tip System**: Customers can tip drivers before or after delivery

---

## Architecture

### Technology Stack

**Frontend:**
- React 19 with TypeScript
- Tailwind CSS 4 for styling
- shadcn/ui component library
- Wouter for routing
- tRPC for type-safe API calls

**Backend:**
- Node.js with Express
- tRPC for API procedures
- MySQL/TiDB database
- Drizzle ORM for database management

**Mobile (Flutter):**
- Flutter for cross-platform mobile apps
- Firebase for backend services
- Google Maps integration
- BLoC pattern for state management

### Directory Structure

```
zimbites/
├── client/                    # React frontend
│   ├── src/
│   │   ├── pages/            # Page components
│   │   ├── components/       # Reusable UI components
│   │   ├── lib/              # Utilities and helpers
│   │   ├── App.tsx           # Main app router
│   │   └── main.tsx          # Entry point
│   └── index.html
├── server/                    # Node.js backend
│   ├── routers.ts            # tRPC procedures
│   ├── db.ts                 # Database queries
│   ├── storage.ts            # File storage helpers
│   └── _core/                # Core infrastructure
├── drizzle/                   # Database schema
│   ├── schema.ts             # Table definitions
│   └── migrations/           # Migration files
├── shared/                    # Shared types and constants
├── flutter_apps/             # Flutter source code
│   ├── customer_app/
│   ├── driver_app/
│   └── shared/
└── docs/                      # Documentation
```

---

## Database Schema

### Core Tables

#### Users Table
Stores user information with role-based access control.

```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  openId VARCHAR(64) UNIQUE NOT NULL,
  name TEXT,
  email VARCHAR(320),
  loginMethod VARCHAR(64),
  role ENUM('user', 'admin') DEFAULT 'user',
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW() ON UPDATE CURRENT_TIMESTAMP
);
```

#### Restaurants Table
Manages restaurant information and settings.

```sql
CREATE TABLE restaurants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  ownerId INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  imageUrl VARCHAR(512),
  address TEXT NOT NULL,
  latitude VARCHAR(50),
  longitude VARCHAR(50),
  phoneNumber VARCHAR(20),
  deliveryRadius INT DEFAULT 15,
  minOrderAmount INT DEFAULT 0,
  isActive INT DEFAULT 1,
  isApproved INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW() ON UPDATE CURRENT_TIMESTAMP
);
```

#### Menu Items Table
Stores restaurant menu items with pricing and availability.

```sql
CREATE TABLE menuItems (
  id INT PRIMARY KEY AUTO_INCREMENT,
  restaurantId INT NOT NULL,
  categoryId INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price INT NOT NULL,
  imageUrl VARCHAR(512),
  isAvailable INT DEFAULT 1,
  preparationTime INT DEFAULT 15,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW() ON UPDATE CURRENT_TIMESTAMP
);
```

#### Orders Table
Complete order lifecycle tracking.

```sql
CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  customerId INT NOT NULL,
  restaurantId INT NOT NULL,
  driverId INT,
  orderNumber VARCHAR(50) UNIQUE NOT NULL,
  status ENUM('pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'in_transit', 'delivered', 'cancelled'),
  deliveryAddress TEXT NOT NULL,
  deliveryLatitude VARCHAR(50),
  deliveryLongitude VARCHAR(50),
  subtotal INT NOT NULL,
  deliveryFee INT NOT NULL,
  platformCommission INT NOT NULL,
  tip INT DEFAULT 0,
  total INT NOT NULL,
  paymentMethod VARCHAR(50) NOT NULL,
  paymentStatus ENUM('pending', 'completed', 'failed', 'refunded'),
  paymentReference VARCHAR(255),
  specialInstructions TEXT,
  estimatedDeliveryTime TIMESTAMP,
  pickedUpAt TIMESTAMP,
  deliveredAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW() ON UPDATE CURRENT_TIMESTAMP
);
```

#### Drivers Table
Driver profile and status management.

```sql
CREATE TABLE drivers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  phoneNumber VARCHAR(20) NOT NULL,
  vehicleType VARCHAR(50) NOT NULL,
  licensePlate VARCHAR(50),
  status ENUM('available', 'on_delivery', 'offline', 'suspended') DEFAULT 'offline',
  currentLatitude VARCHAR(50),
  currentLongitude VARCHAR(50),
  lastLocationUpdate TIMESTAMP,
  isApproved INT DEFAULT 0,
  totalDeliveries INT DEFAULT 0,
  averageRating VARCHAR(10) DEFAULT '0.0',
  totalEarnings INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW() ON UPDATE CURRENT_TIMESTAMP
);
```

#### Payments Table
Payment transaction records.

```sql
CREATE TABLE payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  orderId INT NOT NULL,
  amount INT NOT NULL,
  method VARCHAR(50) NOT NULL,
  status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  reference VARCHAR(255),
  transactionId VARCHAR(255),
  metadata TEXT,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW() ON UPDATE CURRENT_TIMESTAMP
);
```

#### Driver Wallets Table
Track driver earnings and balance.

```sql
CREATE TABLE driverWallets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  driverId INT UNIQUE NOT NULL,
  availableBalance INT DEFAULT 0,
  pendingEarnings INT DEFAULT 0,
  totalEarnings INT DEFAULT 0,
  totalTips INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW() ON UPDATE CURRENT_TIMESTAMP
);
```

#### Ratings Table
Customer ratings for restaurants and drivers.

```sql
CREATE TABLE ratings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  orderId INT NOT NULL,
  customerId INT NOT NULL,
  restaurantId INT,
  driverId INT,
  rating INT NOT NULL,
  comment TEXT,
  ratedAt TIMESTAMP DEFAULT NOW(),
  createdAt TIMESTAMP DEFAULT NOW()
);
```

---

## API Documentation

### Authentication Endpoints

#### Get Current User
```typescript
trpc.auth.me.useQuery()
```
Returns the current authenticated user or null if not logged in.

#### Logout
```typescript
trpc.auth.logout.useMutation()
```
Clears the session cookie and logs out the user.

### Restaurant Management

#### Create Restaurant
```typescript
trpc.restaurant.create.useMutation({
  name: string,
  description?: string,
  address: string,
  latitude?: string,
  longitude?: string,
  phoneNumber?: string,
  deliveryRadius?: number,
  minOrderAmount?: number,
})
```

#### Get Approved Restaurants
```typescript
trpc.restaurant.getApproved.useQuery()
```
Returns all approved and active restaurants.

#### Get Restaurant by ID
```typescript
trpc.restaurant.getById.useQuery({ id: number })
```

### Menu Management

#### Get Menu Categories
```typescript
trpc.menu.getCategories.useQuery({ restaurantId: number })
```

#### Get Menu Items by Category
```typescript
trpc.menu.getItems.useQuery({ categoryId: number })
```

#### Create Menu Item
```typescript
trpc.menu.createItem.useMutation({
  restaurantId: number,
  categoryId: number,
  name: string,
  description?: string,
  price: number,
  imageUrl?: string,
  preparationTime?: number,
})
```

### Order Management

#### Create Order
```typescript
trpc.order.create.useMutation({
  restaurantId: number,
  items: Array<{
    menuItemId: number,
    quantity: number,
  }>,
  deliveryAddress: string,
  deliveryLatitude?: string,
  deliveryLongitude?: string,
  paymentMethod: string,
  specialInstructions?: string,
  tip?: number,
})
```

#### Get Order by ID
```typescript
trpc.order.getById.useQuery({ id: number })
```

#### Get Customer Orders
```typescript
trpc.order.getByCustomer.useQuery()
```

#### Update Order Status
```typescript
trpc.order.updateStatus.useMutation({
  orderId: number,
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled',
})
```

### Payment Processing

#### Get Payment Methods
```typescript
trpc.payment.getPaymentMethods.useQuery()
```
Returns available payment methods: EcoCash, InnBucks, OneMoney, Omari, Bank Transfer, Cash on Delivery.

#### Confirm Payment Reference
```typescript
trpc.payment.confirmPaymentReference.useMutation({
  orderId: number,
  paymentMethod: string,
  reference: string,
})
```

### Driver Management

#### Register as Driver
```typescript
trpc.driver.register.useMutation({
  phoneNumber: string,
  vehicleType: string,
  licensePlate?: string,
})
```

#### Get Driver Profile
```typescript
trpc.driver.getProfile.useQuery()
```

#### Update Location
```typescript
trpc.driver.updateLocation.useMutation({
  latitude: string,
  longitude: string,
})
```

#### Get Assigned Deliveries
```typescript
trpc.driver.getAssignedDeliveries.useQuery()
```

#### Get Driver Wallet
```typescript
trpc.driver.getWallet.useQuery()
```

### Ratings & Reviews

#### Create Rating
```typescript
trpc.rating.create.useMutation({
  orderId: number,
  restaurantId?: number,
  driverId?: number,
  rating: number,
  comment?: string,
})
```

#### Get Restaurant Ratings
```typescript
trpc.rating.getRestaurantRatings.useQuery({ restaurantId: number })
```

#### Get Driver Ratings
```typescript
trpc.rating.getDriverRatings.useQuery({ driverId: number })
```

### Tips

#### Add Tip
```typescript
trpc.tip.addTip.useMutation({
  orderId: number,
  driverId: number,
  amount: number,
})
```

### Admin Features

#### Get Platform Settings
```typescript
trpc.admin.getPlatformSettings.useQuery()
```

#### Update Platform Settings
```typescript
trpc.admin.updatePlatformSettings.useMutation({
  commission_percentage?: number,
  delivery_fee_base?: number,
  delivery_fee_per_km?: number,
  max_delivery_radius?: number,
  min_order_amount?: number,
})
```

#### Get Reports
```typescript
trpc.admin.getReports.useQuery({
  startDate: Date,
  endDate: Date,
})
```

---

## Frontend Implementation

### Customer App Pages

#### Home Page (`/`)
- Browse approved restaurants
- Search functionality
- Filter by category
- View restaurant details (rating, delivery range, contact)

#### Restaurant Details (`/restaurant/:id`)
- View restaurant information
- Browse menu by category
- Add items to cart
- View item details and pricing

#### Checkout (`/checkout`)
- Enter delivery address
- Select payment method
- Enter payment reference
- Add tip (before or after delivery)
- View order summary

### Key Components

#### RestaurantCard
Displays restaurant information in grid layout with quick access to details.

#### MenuItemCard
Shows menu item with image, price, description, and add to cart button.

#### PaymentMethodSelector
Interactive payment method selection with reference input for Zimbabwe payment providers.

#### OrderSummary
Displays order breakdown with subtotal, delivery fee, platform commission, and tip.

---

## Deployment Guide

### Prerequisites

- Node.js 18+
- MySQL 8.0+ or TiDB
- Manus account with OAuth configured
- Google Maps API key (for location features)

### Environment Variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/zimbites

# Authentication
JWT_SECRET=your-jwt-secret-key
VITE_APP_ID=your-manus-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# Owner Information
OWNER_OPEN_ID=your-owner-open-id
OWNER_NAME=Your Name

# Manus APIs
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your-api-key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=your-frontend-api-key

# Analytics
VITE_ANALYTICS_ENDPOINT=https://analytics.manus.im
VITE_ANALYTICS_WEBSITE_ID=your-website-id

# App Configuration
VITE_APP_TITLE=Zimbites
VITE_APP_LOGO=https://your-logo-url.png
```

### Installation & Setup

1. **Clone and Install Dependencies**
   ```bash
   cd /home/ubuntu/zimbites
   pnpm install
   ```

2. **Generate Database Migrations**
   ```bash
   pnpm drizzle-kit generate
   ```

3. **Apply Database Schema**
   ```bash
   # Run migrations via webdev_execute_sql or manually
   mysql -u user -p database_name < drizzle/0001_futuristic_onslaught.sql
   ```

4. **Start Development Server**
   ```bash
   pnpm dev
   ```
   Server runs on `http://localhost:3000`

5. **Build for Production**
   ```bash
   pnpm build
   ```

6. **Start Production Server**
   ```bash
   pnpm start
   ```

### Deployment to Manus

1. Create a checkpoint in the Manus UI
2. Click the "Publish" button to deploy
3. Your app will be available at `https://zimbites.manus.space`

---

## Flutter Apps

### Customer App

**Features:**
- User authentication with Firebase
- Browse restaurants and menus
- Shopping cart management
- Multiple payment methods
- Real-time order tracking
- Google Maps integration
- Ratings and reviews
- Delivery address management

**Build Instructions:**

```bash
cd flutter_apps/customer_app

# Get dependencies
flutter pub get

# Build APK
flutter build apk --release

# Build iOS
flutter build ios --release
```

### Driver App

**Features:**
- Driver authentication
- View available deliveries
- Accept/reject deliveries
- Real-time location tracking
- Delivery status updates
- Earnings tracking
- Ratings view

**Build Instructions:**

```bash
cd flutter_apps/driver_app

# Get dependencies
flutter pub get

# Build APK
flutter build apk --release
```

---

## Firebase Integration

### Firestore Collections

#### users
```json
{
  "uid": "user-id",
  "name": "User Name",
  "email": "user@example.com",
  "role": "customer|driver|restaurant|admin",
  "createdAt": timestamp,
  "updatedAt": timestamp
}
```

#### restaurants
```json
{
  "id": "restaurant-id",
  "ownerId": "user-id",
  "name": "Restaurant Name",
  "description": "Description",
  "address": "Address",
  "location": {
    "latitude": 0.0,
    "longitude": 0.0
  },
  "deliveryRadius": 15,
  "isApproved": true,
  "createdAt": timestamp
}
```

#### orders
```json
{
  "id": "order-id",
  "customerId": "user-id",
  "restaurantId": "restaurant-id",
  "driverId": "driver-id",
  "status": "pending|confirmed|preparing|ready|picked_up|in_transit|delivered",
  "items": [
    {
      "menuItemId": "item-id",
      "name": "Item Name",
      "quantity": 1,
      "price": 5000
    }
  ],
  "deliveryAddress": "Address",
  "location": {
    "latitude": 0.0,
    "longitude": 0.0
  },
  "total": 15500,
  "paymentMethod": "ecocash",
  "paymentStatus": "pending|completed",
  "createdAt": timestamp,
  "updatedAt": timestamp
}
```

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Restaurants can read/write their own data
    match /restaurants/{restaurantId} {
      allow read: if true;
      allow write: if request.auth.uid == resource.data.ownerId;
      
      // Menu items
      match /menuItems/{itemId} {
        allow read: if true;
        allow write: if request.auth.uid == get(/databases/$(database)/documents/restaurants/$(restaurantId)).data.ownerId;
      }
    }

    // Orders
    match /orders/{orderId} {
      allow read: if request.auth.uid == resource.data.customerId || 
                     request.auth.uid == resource.data.driverId ||
                     request.auth.token.admin == true;
      allow create: if request.auth.uid == request.resource.data.customerId;
      allow update: if request.auth.uid == resource.data.customerId ||
                       request.auth.uid == resource.data.driverId ||
                       request.auth.token.admin == true;
    }

    // Drivers
    match /drivers/{driverId} {
      allow read: if request.auth.uid == resource.data.userId || request.auth.token.admin == true;
      allow write: if request.auth.uid == resource.data.userId;
    }

    // Payments
    match /payments/{paymentId} {
      allow read, write: if request.auth.token.admin == true;
    }
  }
}
```

### Cloud Functions

#### Order Status Update Trigger
```typescript
export const onOrderStatusUpdate = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const previousData = change.before.data();

    if (newData.status !== previousData.status) {
      // Send notifications to customer and driver
      // Update driver earnings if delivered
      // Trigger payment processing if needed
    }
  });
```

#### Payment Confirmation
```typescript
export const confirmPayment = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'User not authenticated');

  const { orderId, paymentMethod, reference } = data;

  // Verify payment with payment provider
  // Update order payment status
  // Send confirmation notification
});
```

---

## Zimbabwe Payment Methods

### EcoCash
- **Provider**: Econet Wireless
- **Integration**: Reference-based confirmation
- **Flow**: Customer enters transaction reference after payment

### InnBucks
- **Provider**: Innscor Africa
- **Integration**: Reference-based confirmation
- **Flow**: Customer enters transaction reference after payment

### OneMoney
- **Provider**: Telecel Zimbabwe
- **Integration**: Reference-based confirmation
- **Flow**: Customer enters transaction reference after payment

### Omari
- **Provider**: Omari Digital
- **Integration**: Reference-based confirmation
- **Flow**: Customer enters transaction reference after payment

### Bank Transfer
- **Integration**: Manual confirmation
- **Flow**: Customer provides bank transfer reference

### Cash on Delivery
- **Integration**: No pre-payment required
- **Flow**: Driver collects payment at delivery

---

## Monitoring & Analytics

### Key Metrics

- **Order Metrics**: Total orders, completed orders, cancelled orders, average order value
- **Revenue Metrics**: Daily revenue, weekly revenue, monthly revenue, platform commission
- **Driver Metrics**: Total deliveries, average rating, earnings, tips
- **Restaurant Metrics**: Orders received, acceptance rate, average preparation time
- **Payment Metrics**: Payment method breakdown, failed payments, refunds

### Logging

All API calls, errors, and important events are logged to `.manus-logs/`:
- `devserver.log` - Server startup and runtime logs
- `browserConsole.log` - Client-side console logs
- `networkRequests.log` - HTTP requests and responses
- `sessionReplay.log` - User interaction events

---

## Support & Maintenance

### Common Issues

**Database Connection Error**
- Verify DATABASE_URL is correct
- Check MySQL/TiDB server is running
- Ensure database user has proper permissions

**Payment Reference Not Confirming**
- Verify payment reference format matches provider requirements
- Check payment provider API status
- Ensure order exists and is in correct status

**Location Tracking Not Working**
- Verify Google Maps API key is valid
- Check browser location permissions
- Ensure driver has enabled location services

### Performance Optimization

- Implement caching for restaurant and menu data
- Use database indexes on frequently queried fields
- Optimize image sizes for menu items
- Implement lazy loading for order history
- Use pagination for large result sets

---

## Version History

- **v1.0.0** (June 2026) - Initial release with core features
  - Customer app with restaurant browsing and ordering
  - Restaurant portal for menu and order management
  - Driver app with delivery tracking
  - Admin dashboard with platform management
  - Zimbabwe payment integration
  - Real-time order tracking

---

## License

This project is proprietary software for Zimbites. All rights reserved.

---

## Contact & Support

For support, issues, or feature requests, please contact the Zimbites development team.
