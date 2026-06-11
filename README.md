# ZimBites - Multi-Vendor Food Delivery Platform

> [!IMPORTANT]
> **🤖 AI AGENT ONBOARDING:**
> This repository is managed by multiple AI agents (Manus, OpenHands, ChatGPT). To prevent code conflicts and save credits, **read [AGENT_SYNC.md](./AGENT_SYNC.md) and [AGENT_SYNC_GUIDE.md](./AGENT_SYNC_GUIDE.md) BEFORE starting any task.** These files contain the live project status, database state, and multi-agent coordination rules.

A production-ready multi-vendor food delivery platform similar to Uber Eats, DoorDash, or Glovo, branded as ZimBites for the Zimbabwe market.

![ZimBites Logo](https://via.placeholder.com/800x200?text=ZimBites+Food+Delivery)

## 🌟 Features

### Customer Features
- **Restaurant Browsing**: Browse restaurants by cuisine, rating, and distance
- **Menu Viewing**: View detailed menus with prices, descriptions, and preparation times
- **Shopping Cart**: Add items to cart with quantity management
- **Checkout**: Complete orders with delivery address and payment method
- **Order Tracking**: Real-time order status updates
- **Order History**: View past orders and reorder
- **Profile Management**: Update personal information

### Restaurant Dashboard
- **Order Management**: Accept/reject orders, mark preparing, mark ready
- **Menu Management**: Create, update, and delete categories and items
- **Analytics**: View daily/monthly revenue and order statistics
- **Settings**: Configure restaurant details and availability

### Driver App
- **Delivery Queue**: View and accept available deliveries
- **Active Delivery**: Navigate to pickup and delivery locations
- **Earnings Tracking**: View wallet balance and delivery history
- **Status Management**: Toggle availability online/offline

### Admin Dashboard
- **User Management**: Manage all platform users and roles
- **Restaurant Approval**: Approve and manage restaurants
- **Driver Management**: Approve drivers and manage their status
- **Order Monitoring**: Monitor all platform orders
- **Analytics**: Platform-wide statistics and reports
- **Settings**: Configure platform-wide settings

## 🏗️ Tech Stack

### Frontend
- **React 19** with TypeScript
- **Tailwind CSS 4** for styling
- **shadcn/ui** components
- **tRPC** for type-safe API calls
- **Wouter** for routing
- **Recharts** for analytics charts

### Backend
- **Node.js** with Express
- **tRPC** for API layer
- **Drizzle ORM** for database
- **MySQL/TiDB** for database

### DevOps
- **Docker** & **Docker Compose** for containerization
- **GitHub Actions** for CI/CD
- **pnpm** for package management

## 📁 Project Structure

```
zimbites/
├── client/                    # Frontend React application
│   ├── src/
│   │   ├── pages/            # Page components
│   │   ├── components/       # Reusable UI components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utilities and tRPC client
│   │   └── _core/            # Framework components
│   └── public/               # Static assets
├── server/                    # Backend API server
│   ├── _core/                # Framework components
│   ├── db.ts                 # Database helpers
│   └── routers.ts            # tRPC routers
├── drizzle/                   # Database schema and migrations
│   ├── schema.ts             # Database tables
│   └── migrations/           # SQL migrations
├── shared/                    # Shared types and constants
├── .github/workflows/         # CI/CD pipelines
├── Dockerfile                 # Production Docker image
├── docker-compose.yml         # Local development setup
└── .env.example               # Environment variables template
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- pnpm 10.4+
- MySQL 8.0+ or TiDB

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/fingerprintacoustic/zimbites.git
cd zimbites
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Run database migrations**
```bash
pnpm db:push
```

5. **Seed demo data (optional)**
```bash
pnpm db:seed
```

6. **Start the development server**
```bash
pnpm dev
```

The application will be available at `http://localhost:3000`.

## 🐳 Docker Deployment

### Using Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

### Production Docker Build

```bash
# Build the production image
docker build -t zimbites:latest .

# Run the container
docker run -d -p 3000:3000 --env-file .env zimbites:latest
```

## 📋 Demo Accounts

After running `pnpm db:seed`, the following demo accounts will be available:

| Role       | Email                    | Password      |
|------------|--------------------------|---------------|
| Admin      | admin@zimbites.com       | ChangeMe123!  |
| Restaurant | marcus@zimbites.com      | ChangeMe123!  |
| Driver     | david.driver@zimbites.com| ChangeMe123!  |
| Customer   | john@example.com         | ChangeMe123!  |

## 🔌 API Documentation

### Authentication
- `auth.me` - Get current user
- `auth.logout` - Logout user

### Restaurants
- `restaurant.getAll` - List all approved restaurants
- `restaurant.getById` - Get restaurant details
- `restaurant.getByOwner` - Get restaurants for current owner
- `restaurant.create` - Create a new restaurant
- `restaurant.update` - Update restaurant details

### Menu
- `menu.getByRestaurant` - Get menu categories and items
- `menu.createCategory` - Create menu category
- `menu.createItem` - Create menu item
- `menu.updateItem` - Update menu item
- `menu.deleteItem` - Delete menu item

### Cart
- `cart.get` - Get user's cart
- `cart.addItem` - Add item to cart
- `cart.updateItem` - Update cart item quantity
- `cart.removeItem` - Remove item from cart
- `cart.clear` - Clear the cart

### Orders
- `order.create` - Create a new order
- `order.getById` - Get order details
- `order.getByCustomer` - Get customer's orders
- `order.accept` - Restaurant accepts order
- `order.reject` - Restaurant rejects order
- `order.startPreparing` - Restaurant starts preparing
- `order.markReady` - Restaurant marks ready for pickup
- `order.confirmPickup` - Driver confirms pickup
- `order.confirmDelivery` - Confirm delivery
- `order.confirmByCustomer` - Customer confirms delivery
- `order.cancel` - Cancel order

### Driver
- `driver.getProfile` - Get driver profile
- `driver.getWallet` - Get driver wallet
- `driver.register` - Register as driver
- `driver.updateStatus` - Update availability status
- `driver.getAvailableOrders` - Get available deliveries
- `driver.acceptDelivery` - Accept a delivery

### Notifications
- `notification.getAll` - Get user notifications
- `notification.getUnreadCount` - Get unread count
- `notification.markAsRead` - Mark notification as read

### Admin
- `admin.getStats` - Get platform statistics
- `admin.getUsers` - Get all users
- `admin.updateUserRole` - Update user role
- `admin.getRestaurants` - Get all restaurants
- `admin.approveRestaurant` - Approve restaurant
- `admin.getDrivers` - Get all drivers
- `admin.approveDriver` - Approve driver
- `admin.getOrders` - Get all orders

## 📊 Order Status Lifecycle

Orders follow this status progression:

```
PENDING
    ↓
ACCEPTED
    ↓
PREPARING
    ↓
READY_FOR_PICKUP
    ↓
DRIVER_ASSIGNED
    ↓
PICKED_UP
    ↓
OUT_FOR_DELIVERY
    ↓
DELIVERED
    ↓
CUSTOMER_CONFIRMED
```

Additional terminal statuses:
- `CANCELLED` - Order cancelled
- `REJECTED` - Order rejected by restaurant
- `REFUNDED` - Order refunded

## 🔒 Security

- Password hashing with bcrypt
- Session-based authentication with secure cookies
- Role-based access control (RBAC)
- Input validation with Zod
- SQL injection prevention with parameterized queries

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test --coverage

# Run E2E tests
pnpm test:e2e
```

## 📈 Analytics

### Restaurant Analytics
- Daily and monthly order counts
- Revenue tracking
- Top menu items
- Average order value

### Driver Analytics
- Completed deliveries count
- Average delivery time
- Earnings and tips
- Rating history

### Platform Analytics
- Total users, restaurants, and drivers
- Daily and monthly order volumes
- Platform revenue and commissions

## 🔮 Future Features

- **Stripe Integration** - Online payments
- **PayPal Integration** - Alternative payment method
- **Real-time Tracking** - Live driver location on map
- **Push Notifications** - Mobile notifications
- **SMS Alerts** - Order status via SMS
- **Review System** - Ratings and reviews for restaurants and drivers

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## 📞 Support

For questions or support, please open an issue on GitHub.

---

Built with ❤️ for the Zimbabwe food delivery market