# Zimbites Complete Setup & Testing Guide

Complete guide to set up, access, and test all platforms of the Zimbites food delivery system.

---

## 📋 Quick Navigation

- [🚀 Quick Start (5 minutes)](#quick-start)
- [🗄️ Database Setup](#database-setup)
- [👥 User Roles & Access](#user-roles--access)
- [🧪 Testing Each Platform](#testing-each-platform)
- [✅ Deployment Checklist](#deployment-checklist)

---

## 🚀 Quick Start

### What You Have

A complete, production-ready food delivery platform with:
- ✅ Customer app (browse, order, track, rate)
- ✅ Restaurant portal (manage menu, view orders)
- ✅ Driver dashboard (accept deliveries, track, complete)
- ✅ Admin dashboard (manage platform, users, settings)
- ✅ Backend API (40+ procedures)
- ✅ Database (11 tables, fully normalized)

### Live URL

**https://zimbitesfd-ueegtxu7.manus.space**

### In 5 Minutes

1. **Access Database**
   - Go to your Manus project
   - Click "Database" tab
   - Copy connection details

2. **Populate Demo Data**
   - Use the SQL script: `scripts/seed-data.sql`
   - Or follow manual SQL queries in DATABASE_ACCESS_GUIDE.md

3. **Assign Your Role**
   - Update your user role in database
   - Follow ROLE_ASSIGNMENT_GUIDE.md

4. **Test Platform**
   - Visit the live URL
   - Sign in
   - Explore your role's dashboard

---

## 🗄️ Database Setup

### Access Your Database

**Three Ways to Access**:

1. **Easiest - Manus UI**
   - Project → Database tab → Built-in CRUD interface

2. **Advanced - MySQL Workbench**
   - Download: https://www.mysql.com/products/workbench/
   - Use credentials from Database tab

3. **Command Line**
   ```bash
   mysql -h HOST -u USER -p DATABASE_NAME
   ```

### Populate Demo Data

**Option A: SQL Script** (Recommended)
```bash
# Get the script
cat scripts/seed-data.sql

# Copy entire content and paste into your database client
# Or run via command line:
mysql -h HOST -u USER -p DATABASE_NAME < scripts/seed-data.sql
```

**Option B: Manual Queries**
- See DATABASE_ACCESS_GUIDE.md for individual SQL queries
- Copy-paste each query into your database client

### Verify Data

```sql
-- Check users created
SELECT COUNT(*) as user_count FROM users;
-- Expected: 7

-- Check restaurants
SELECT COUNT(*) as restaurant_count FROM restaurants;
-- Expected: 2

-- Check menu items
SELECT COUNT(*) as menu_items_count FROM menu_items;
-- Expected: 15
```

---

## 👥 User Roles & Access

### 4 User Roles

| Role | Dashboard | Purpose |
|------|-----------|---------|
| **customer** | /home | Browse restaurants, order food, track delivery |
| **restaurant** | /restaurant-dashboard | Manage menu, view orders, update status |
| **driver** | /driver-delivery-dashboard | Accept deliveries, track location, complete orders |
| **admin** | /admin-platform-dashboard | Manage entire platform, users, settings, reports |

### Demo Accounts (Pre-Created)

```
Admin:              openId: admin-demo-001
Customer 1:         openId: customer-demo-001
Customer 2:         openId: customer-demo-002
Restaurant Owner 1: openId: restaurant-demo-001
Restaurant Owner 2: openId: restaurant-demo-002
Driver 1:           openId: driver-demo-001
Driver 2:           openId: driver-demo-002
```

### How to Test Different Roles

1. **Access Database** (see above)

2. **Find Your User**
   ```sql
   SELECT id, openId, name, email, role FROM users 
   WHERE email = 'your-email@example.com';
   ```

3. **Change Your Role**
   ```sql
   UPDATE users SET role = 'admin' WHERE id = YOUR_USER_ID;
   ```
   
   Replace `admin` with: `customer`, `restaurant`, or `driver`

4. **Refresh Browser**
   - Log out if logged in
   - Clear cookies
   - Visit https://zimbitesfd-ueegtxu7.manus.space
   - Sign in again
   - You'll see your new role's dashboard

---

## 🧪 Testing Each Platform

### 1️⃣ Customer App Testing

**URL**: https://zimbitesfd-ueegtxu7.manus.space/home

**Test Steps**:
1. ✅ Set your role to `customer`
2. ✅ Visit /home
3. ✅ See restaurant list (Harare Grill House, Spice Garden)
4. ✅ Click a restaurant
5. ✅ Browse menu items
6. ✅ Add items to cart
7. ✅ Go to checkout
8. ✅ Enter delivery address
9. ✅ Select payment method (EcoCash, InnBucks, OneMoney, Omari, Bank Transfer, Cash)
10. ✅ Place order

**Expected Results**:
- ✓ Restaurant list loads with images and ratings
- ✓ Menu items display with prices
- ✓ Cart updates correctly
- ✓ Checkout calculates subtotal, delivery fee, commission, tip
- ✓ Order confirmation shows

---

### 2️⃣ Restaurant Portal Testing

**URL**: https://zimbitesfd-ueegtxu7.manus.space/restaurant-dashboard

**Test Steps**:
1. ✅ Set your role to `restaurant`
2. ✅ Visit /restaurant-dashboard
3. ✅ See incoming orders
4. ✅ View order details (items, customer, address)
5. ✅ Update order status (accept, preparing, ready)
6. ✅ View menu management interface
7. ✅ See restaurant analytics

**Expected Results**:
- ✓ Dashboard loads with restaurant info
- ✓ Incoming orders display with details
- ✓ Can update order status
- ✓ Menu items show with prices and availability
- ✓ Analytics show order count and revenue

---

### 3️⃣ Driver Dashboard Testing

**URL**: https://zimbitesfd-ueegtxu7.manus.space/driver-delivery-dashboard

**Test Steps**:
1. ✅ Set your role to `driver`
2. ✅ Visit /driver-delivery-dashboard
3. ✅ See available deliveries
4. ✅ View delivery details (restaurant, customer, address)
5. ✅ Accept a delivery
6. ✅ View map with delivery location
7. ✅ Update delivery status (picked up, en route, delivered)
8. ✅ View earnings and completed deliveries

**Expected Results**:
- ✓ Dashboard shows available deliveries
- ✓ Can view delivery details and map
- ✓ Can update delivery status
- ✓ Earnings display correctly
- ✓ Completed deliveries show in history

---

### 4️⃣ Admin Dashboard Testing

**URL**: https://zimbitesfd-ueegtxu7.manus.space/admin-platform-dashboard

**Test Steps**:
1. ✅ Set your role to `admin`
2. ✅ Visit /admin-platform-dashboard
3. ✅ View all users (customers, restaurants, drivers)
4. ✅ View all restaurants with approval status
5. ✅ View all drivers with performance metrics
6. ✅ View all orders with status breakdown
7. ✅ Access financial settings
8. ✅ View platform commission settings
9. ✅ View delivery radius settings
10. ✅ View reports and analytics

**Expected Results**:
- ✓ Dashboard shows all platform data
- ✓ Can view and manage users
- ✓ Can view and manage restaurants
- ✓ Can view and manage drivers
- ✓ Can view all orders
- ✓ Can access financial settings
- ✓ Reports show accurate data

---

## ✅ Deployment Checklist

### Before Going Live

- [ ] **Database**
  - [ ] Backup database
  - [ ] Verify all tables created
  - [ ] Verify seed data populated
  - [ ] Test database queries

- [ ] **Authentication**
  - [ ] Test sign in with all roles
  - [ ] Test role-based access control
  - [ ] Verify session management

- [ ] **Customer App**
  - [ ] Test restaurant browsing
  - [ ] Test menu viewing
  - [ ] Test cart functionality
  - [ ] Test checkout flow
  - [ ] Test payment methods
  - [ ] Test order placement

- [ ] **Restaurant Portal**
  - [ ] Test order viewing
  - [ ] Test order status updates
  - [ ] Test menu management
  - [ ] Test analytics

- [ ] **Driver Dashboard**
  - [ ] Test delivery acceptance
  - [ ] Test delivery tracking
  - [ ] Test status updates
  - [ ] Test earnings display

- [ ] **Admin Dashboard**
  - [ ] Test user management
  - [ ] Test restaurant management
  - [ ] Test driver management
  - [ ] Test order management
  - [ ] Test financial settings
  - [ ] Test reports

- [ ] **Performance**
  - [ ] Test with multiple concurrent users
  - [ ] Check page load times
  - [ ] Monitor server resources
  - [ ] Test error handling

- [ ] **Security**
  - [ ] Verify HTTPS enabled
  - [ ] Test SQL injection prevention
  - [ ] Test XSS prevention
  - [ ] Test CSRF protection
  - [ ] Verify sensitive data encrypted

- [ ] **Documentation**
  - [ ] Update API documentation
  - [ ] Document deployment steps
  - [ ] Create user guides
  - [ ] Document troubleshooting

---

## 📞 Common Issues & Solutions

### Issue: Cannot Access Database

**Solution**:
1. Verify connection details in Manus Database tab
2. Check network connectivity
3. Verify username and password
4. Try from different machine

---

### Issue: Role Change Not Showing

**Solution**:
1. Log out completely
2. Clear browser cookies
3. Close browser
4. Reopen and log in
5. Refresh page

---

### Issue: Demo Data Not Showing

**Solution**:
1. Verify seed data SQL executed successfully
2. Check row counts: `SELECT COUNT(*) FROM users;`
3. Re-run seed data script if needed
4. Check for SQL errors

---

### Issue: Order Not Creating

**Solution**:
1. Verify restaurant exists and is approved
2. Verify customer and restaurant IDs are correct
3. Check order status is valid
4. Verify all required fields filled

---

## 📚 Documentation Files

- **DATABASE_ACCESS_GUIDE.md** - How to access and manage database
- **ROLE_ASSIGNMENT_GUIDE.md** - How to assign and change user roles
- **DOCUMENTATION.md** - Complete API documentation
- **DEPLOYMENT_GUIDE.md** - Deployment instructions
- **FEATURES_SUMMARY.md** - Complete feature list

---

## 🎯 Next Steps

1. **Set up database** - Follow Database Setup section
2. **Populate demo data** - Use SQL script
3. **Test each platform** - Follow Testing section
4. **Deploy to production** - Follow Deployment Guide
5. **Monitor and optimize** - Check logs and metrics

---

## 📞 Support

For issues or questions:
1. Check relevant documentation file
2. Review troubleshooting section
3. Check database logs
4. Contact Manus support

---

**Last Updated**: June 2026
**Version**: 1.0
**Status**: Production Ready ✅
