# Zimbites Production Deployment Guide

## Overview

Zimbites is now production-ready with support for real restaurants, drivers, customers, and financial transactions in Zimbabwe. This guide covers deployment, configuration, and operation.

## System Architecture

### Core Components

1. **Frontend** - React + TypeScript with TailwindCSS
2. **Backend** - Node.js + Express + tRPC
3. **Database** - MySQL with Drizzle ORM
4. **Authentication** - Auth0 with OpenID Connect
5. **Payment Processing** - 263Pay integration (placeholder)
6. **GPS Tracking** - Real-time location services
7. **Admin Panel** - Full approval and configuration workflows

### Multi-Currency Support

- **ZWL (Zimbabwean Dollar)** - Primary local currency
- **USD (US Dollar)** - Alternative currency
- All prices stored in cents for precision
- Currency selection at menu item and order level

## Deployment Steps

### 1. Environment Configuration

Create `.env.production` with:

```env
# Database
DATABASE_URL=mysql://user:password@host:port/zimbites_prod

# Auth0
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret

# API Configuration
API_URL=https://zimbites-api.render.com
CLIENT_URL=https://zimbites.render.com

# Payment Processing (263Pay)
PAYMENT_API_KEY=your_263pay_api_key
PAYMENT_API_SECRET=your_263pay_api_secret

# Email Service
SENDGRID_API_KEY=your_sendgrid_api_key

# Admin Configuration
ADMIN_EMAIL=admin@zimbites.com
PLATFORM_COMMISSION_PERCENT=15
```

### 2. Database Setup

```bash
# Run migrations
npm run db:push

# Seed initial data (optional)
npm run db:seed
```

### 3. Render Deployment

```bash
# Push to GitHub
git push origin main

# Render will automatically:
# 1. Build the project
# 2. Run migrations
# 3. Deploy to production
```

## Core Features

### 1. Restaurant Management

**Registration Process:**
1. Restaurant owner fills multi-step registration form
2. Provides bank account details for payouts
3. Application submitted for admin approval
4. Admin reviews and approves/rejects
5. Upon approval, restaurant goes live

**Menu Management:**
- Add/edit/delete menu items
- Set prices in ZWL or USD
- Organize items by category
- Real-time menu updates

**Order Management:**
- View incoming orders in real-time
- Update order status (pending → confirmed → preparing → ready → picked_up)
- Track driver assignments
- View order history and analytics

**Financial Management:**
- View wallet balance
- Request payouts
- Track payout history
- Configure bank account for transfers

### 2. Driver Management

**Registration Process:**
1. Driver fills multi-step registration form
2. Provides vehicle details and license information
3. Configures bank account and withdrawal method
4. Application submitted for admin approval
5. Upon approval, driver can start accepting deliveries

**Delivery Operations:**
- Accept delivery requests
- Real-time GPS tracking
- Navigate to restaurant and customer
- Automatic geofence detection
- Confirm delivery with GPS proof

**Wallet & Earnings:**
- Real-time wallet balance
- Earnings tracking per delivery
- Request withdrawals
- View payout history

### 3. Customer Experience

**Browsing & Ordering:**
- Browse approved restaurants
- View real menus with current prices
- Add items to cart
- Checkout with multi-currency support

**Order Tracking:**
- Real-time order status updates
- Live driver location tracking
- Estimated delivery time
- Driver contact information

**Ratings & Reviews:**
- Rate restaurants and drivers
- Leave detailed reviews
- View community ratings

### 4. Admin Dashboard

**Approval Workflows:**
- Review pending restaurant applications
- Review pending driver applications
- Approve or reject with feedback
- Track approval history

**Financial Management:**
- Configure platform commission rates
- View platform revenue
- Manage payout processing
- Track financial metrics

**Platform Configuration:**
- Set delivery fees
- Configure minimum order amounts
- Manage platform settings
- View system analytics

## GPS Tracking System

### Real-Time Location Updates

Drivers send location updates every 10 seconds during active deliveries:

```typescript
// Driver app sends:
gps.updateLocation({
  assignmentId: 123,
  latitude: -17.8252,
  longitude: 31.0335,
  accuracy: 50 // meters
})
```

### Geofencing

Automatic status updates when driver reaches:

1. **Restaurant (100m radius)** → Status: `picked_up`
2. **Customer (100m radius)** → Status: `delivered`

### Distance-Based Pricing

```
Delivery Fee = Base Fee + (Distance in km × Per-km Rate)
Base Fee: ZWL 200 (USD 1.50)
Per-km Rate: ZWL 50 (USD 0.30)
```

## Financial Routing

### Order Payment Flow

1. **Customer Pays** → Payment captured via 263Pay
2. **Platform Takes Commission** → 15% (configurable)
3. **Restaurant Receives** → 80% of order total
4. **Driver Receives** → 5% of order total + delivery fee

### Payout Processing

**Restaurant Payouts:**
- Automatic daily settlement
- Direct bank transfer
- Minimum payout: ZWL 1000

**Driver Payouts:**
- On-demand withdrawal requests
- Multiple withdrawal methods:
  - Bank transfer
  - Mobile money
  - Cash pickup

## Security Considerations

### Data Protection

- All sensitive data encrypted at rest
- SSL/TLS for all communications
- Bank account details never logged
- PCI compliance for payment data

### Authentication

- OAuth2 with Auth0
- Role-based access control (RBAC)
- Automatic session timeout
- Secure token refresh

### API Security

- Rate limiting on all endpoints
- Input validation and sanitization
- CORS properly configured
- SQL injection prevention via ORM

## Monitoring & Maintenance

### Key Metrics to Monitor

```
- Active restaurants: 50+
- Active drivers: 100+
- Daily orders: 1000+
- Platform revenue: Track daily
- Average delivery time: < 30 min
- Customer satisfaction: > 4.5/5
```

### Scheduled Tasks

- Daily payout processing (2 AM UTC)
- Nightly database backups
- Weekly analytics report
- Monthly financial reconciliation

### Troubleshooting

**GPS Not Updating:**
- Check driver app connectivity
- Verify GPS permissions enabled
- Check assignment status

**Payment Failures:**
- Verify 263Pay API credentials
- Check customer wallet balance
- Review transaction logs

**Slow Performance:**
- Check database query performance
- Review API response times
- Monitor server resources

## Rollback Procedures

### Database Rollback

```bash
# Revert to previous migration
npm run db:rollback
```

### Application Rollback

```bash
# Render automatically keeps previous deployments
# Revert via Render dashboard
```

## Support & Operations

### Admin Contact

- **Email**: admin@zimbites.com
- **Phone**: +263 (to be configured)
- **Support Hours**: 24/7

### Escalation Process

1. Customer/Partner reports issue
2. Admin investigates via dashboard
3. Technical team reviews logs
4. Resolution and follow-up

## Next Steps

1. **Go Live** - Deploy to production
2. **Onboard First Restaurants** - Start with 5-10 pilot restaurants
3. **Recruit Drivers** - Build driver network
4. **Marketing Campaign** - Launch customer acquisition
5. **Monitor & Optimize** - Track metrics and improve

## Compliance

- GDPR compliance for user data
- Local Zimbabwe regulations
- Payment processor requirements
- Consumer protection laws

---

**Version**: 1.0  
**Last Updated**: June 2026  
**Status**: Production Ready
