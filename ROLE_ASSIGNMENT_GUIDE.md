# Role Assignment Guide

Quick guide to assign and change user roles in Zimbites for testing different platforms.

---

## 🎯 Overview

The Zimbites platform has 4 user roles:

| Role | Access | Purpose |
|------|--------|---------|
| **customer** | Customer App | Browse restaurants, place orders, track deliveries |
| **restaurant** | Restaurant Portal | Manage menu, view orders, update status |
| **driver** | Driver Dashboard | Accept deliveries, track location, complete orders |
| **admin** | Admin Dashboard | Manage platform, users, restaurants, drivers, settings |

---

## 🔄 How to Change Your Role

### Step 1: Access the Database

Follow the instructions in [DATABASE_ACCESS_GUIDE.md](./DATABASE_ACCESS_GUIDE.md) to connect to your database using:
- Manus Management UI (easiest)
- MySQL Workbench
- DBeaver
- TablePlus
- Command line

### Step 2: Find Your User ID

First, identify your user record:

**SQL Query**:
```sql
SELECT id, openId, name, email, role 
FROM users 
WHERE email LIKE '%@zimbites.local' OR openId LIKE '%demo%'
ORDER BY createdAt DESC;
```

Or find your specific user:
```sql
SELECT id, openId, name, email, role 
FROM users 
WHERE email = 'your-email@example.com';
```

### Step 3: Update Your Role

Update your user's role to the one you want to test:

**SQL Query**:
```sql
UPDATE users 
SET role = 'admin' 
WHERE id = YOUR_USER_ID;
```

Replace `YOUR_USER_ID` with the ID from Step 2, and `'admin'` with the role you want:
- `'customer'`
- `'restaurant'`
- `'driver'`
- `'admin'`

### Step 4: Refresh Your Browser

1. **Log out** from Zimbites (if logged in)
2. **Clear browser cache** (optional but recommended)
3. **Refresh the page** or **log back in**
4. You should now see the dashboard for your new role

---

## 📝 Demo Test Accounts

Pre-created accounts you can use for testing:

### Admin Account
```sql
SELECT * FROM users WHERE openId = 'admin-demo-001';
```

**To use**: Update your user to have `role = 'admin'`, then visit:
- https://zimbitesfd-ueegtxu7.manus.space/admin-platform-dashboard

---

### Customer Accounts
```sql
SELECT * FROM users WHERE openId IN ('customer-demo-001', 'customer-demo-002');
```

**To use**: Update your user to have `role = 'customer'`, then visit:
- https://zimbitesfd-ueegtxu7.manus.space/home

---

### Restaurant Owner Accounts
```sql
SELECT * FROM users WHERE openId IN ('restaurant-demo-001', 'restaurant-demo-002');
```

**To use**: Update your user to have `role = 'restaurant'`, then visit:
- https://zimbitesfd-ueegtxu7.manus.space/restaurant-dashboard

---

### Driver Accounts
```sql
SELECT * FROM users WHERE openId IN ('driver-demo-001', 'driver-demo-002');
```

**To use**: Update your user to have `role = 'driver'`, then visit:
- https://zimbitesfd-ueegtxu7.manus.space/driver-delivery-dashboard

---

## 🚀 Quick Role Change Script

Use this script to quickly change between roles:

### Change to Admin
```sql
UPDATE users SET role = 'admin' WHERE id = 1;
```

### Change to Customer
```sql
UPDATE users SET role = 'customer' WHERE id = 1;
```

### Change to Restaurant Owner
```sql
UPDATE users SET role = 'restaurant' WHERE id = 1;
```

### Change to Driver
```sql
UPDATE users SET role = 'driver' WHERE id = 1;
```

---

## 🔗 Platform Access URLs

After changing your role, visit these URLs:

| Role | URL |
|------|-----|
| **Customer** | https://zimbitesfd-ueegtxu7.manus.space/home |
| **Restaurant** | https://zimbitesfd-ueegtxu7.manus.space/restaurant-dashboard |
| **Driver** | https://zimbitesfd-ueegtxu7.manus.space/driver-delivery-dashboard |
| **Admin** | https://zimbitesfd-ueegtxu7.manus.space/admin-platform-dashboard |

---

## 🎬 Testing Workflow

### Complete Testing Flow

1. **Start as Customer**
   - Update role to `'customer'`
   - Visit `/home`
   - Browse restaurants
   - Add items to cart
   - Proceed to checkout
   - Place order

2. **Switch to Restaurant Owner**
   - Update role to `'restaurant'`
   - Visit `/restaurant-dashboard`
   - View incoming orders
   - Update order status to "preparing"

3. **Switch to Driver**
   - Update role to `'driver'`
   - Visit `/driver-delivery-dashboard`
   - Accept the order
   - Update status to "picked up"
   - Update status to "delivered"

4. **Switch to Admin**
   - Update role to `'admin'`
   - Visit `/admin-platform-dashboard`
   - View all orders
   - Manage users, restaurants, drivers
   - Check financial reports

---

## 💡 Tips & Tricks

### Tip 1: Create Multiple Test Accounts

Instead of changing one account's role repeatedly, create multiple test accounts:

```sql
INSERT INTO users (openId, name, email, loginMethod, role)
VALUES (
  'test-customer-' + RAND(),
  'Test Customer',
  'test-customer@zimbites.local',
  'demo',
  'customer'
);
```

### Tip 2: View All Your Changes

Track all role changes:

```sql
SELECT id, name, email, role, updatedAt 
FROM users 
ORDER BY updatedAt DESC 
LIMIT 10;
```

### Tip 3: Reset to Original Roles

Reset all demo accounts to their original roles:

```sql
UPDATE users SET role = 'admin' WHERE openId = 'admin-demo-001';
UPDATE users SET role = 'customer' WHERE openId IN ('customer-demo-001', 'customer-demo-002');
UPDATE users SET role = 'restaurant' WHERE openId IN ('restaurant-demo-001', 'restaurant-demo-002');
UPDATE users SET role = 'driver' WHERE openId IN ('driver-demo-001', 'driver-demo-002');
```

### Tip 4: Browser Developer Tools

Use browser DevTools to check your current role:

1. Open DevTools (F12)
2. Go to Application → Cookies
3. Look for session cookie to see your auth state

---

## 🔐 Security Notes

- **Demo accounts** are for testing only
- **Never use** demo credentials in production
- **Change passwords** before deploying to production
- **Restrict database access** to authorized users only
- **Audit role changes** in production environments

---

## 📞 Troubleshooting

### Role Change Not Working

**Problem**: Updated role in database but dashboard didn't change

**Solution**:
1. Log out completely
2. Clear browser cookies
3. Close and reopen browser
4. Log back in
5. Refresh page

---

### Cannot See Dashboard for New Role

**Problem**: Logged in but don't see the expected dashboard

**Solution**:
1. Verify your role was updated: `SELECT role FROM users WHERE id = YOUR_ID;`
2. Check the correct URL for your role (see table above)
3. Clear browser cache
4. Try a different browser

---

### Multiple Roles Assigned

**Problem**: User has multiple roles or wrong role

**Solution**:
```sql
-- Check current role
SELECT id, name, role FROM users WHERE id = YOUR_ID;

-- Fix role
UPDATE users SET role = 'customer' WHERE id = YOUR_ID;
```

---

## 📚 Related Documentation

- [Database Access Guide](./DATABASE_ACCESS_GUIDE.md)
- [Main Documentation](./DOCUMENTATION.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)

---

**Last Updated**: June 2026
**Version**: 1.0
