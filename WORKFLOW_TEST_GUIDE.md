# Zimbites End-to-End Workflow Test Guide

This guide will help you test the complete order lifecycle from customer placement to delivery confirmation.

## Prerequisites

1. **Render Deployment Active**: Ensure your app is deployed on Render (https://render.com)
2. **Database Connected**: MySQL database should be running with seeded data
3. **Test Accounts**: You need at least one account of each role:
   - Customer account
   - Restaurant owner account  
   - Driver account
   - Admin account

## Test Workflow

### STEP 1: Customer Places Order

1. **Login as Customer**
   - Go to your deployed app URL
   - Sign in with a customer account

2. **Browse Restaurants**
   - View the list of approved restaurants
   - Click on a restaurant to see their menu

3. **Add Items to Cart**
   - Select items from the menu
   - Add them to your cart
   - Adjust quantities if needed

4. **Proceed to Checkout**
   - Click "Proceed to Checkout"
   - You should be redirected to `/checkout`

5. **Complete Order**
   - Enter delivery address: "123 Test Street, Harare, Zimbabwe"
   - Select payment method: "Cash on Delivery"
   - Add a tip (optional)
   - Click "Place Order"

**Expected Results:**
- ✅ Order confirmation screen appears
- ✅ Order number is displayed
- ✅ Redirect to order tracking page
- ✅ Cart is cleared

---

### STEP 2: Restaurant Accepts Order

1. **Login as Restaurant Owner**
   - Sign in with a restaurant owner account

2. **View New Orders**
   - Go to Restaurant Dashboard
   - Look for pending orders section
   - You should see the order placed in Step 1

3. **Accept the Order**
   - Click "Accept" or "Confirm" on the pending order
   - The order status should change to "accepted"

4. **Start Preparing**
   - The restaurant owner can mark the order as "preparing"
   - Then "ready_for_pickup" when food is ready

**Expected Results:**
- ✅ Restaurant sees new order notification
- ✅ Can update order status
- ✅ Status changes reflect in database

---

### STEP 3: Driver Picks Up Order

1. **Login as Driver**
   - Sign in with a driver account

2. **View Available Orders**
   - Go to Driver Dashboard
   - Look for "Available Orders" or "Ready for Pickup" section
   - You should see the order ready for pickup

3. **Accept Delivery**
   - Click "Accept" or "Pick Up" on the available order
   - Confirm the pickup

4. **Update Location**
   - The driver app should periodically update location
   - This shows on the order tracking

5. **Out for Delivery**
   - Mark order as "out_for_delivery"
   - Navigate to customer's address

**Expected Results:**
- ✅ Driver sees available orders
- ✅ Can accept and pick up orders
- ✅ Order status changes to "picked_up" then "out_for_delivery"

---

### STEP 4: Confirm Delivery

1. **Driver Marks as Delivered**
   - When arriving at customer location
   - Mark order as "delivered"

2. **Customer Confirms**
   - Customer receives notification
   - Confirms the delivery was received
   - Can rate the order

**Expected Results:**
- ✅ Order status changes to "delivered"
- ✅ Customer can confirm receipt
- ✅ Order status changes to "customer_confirmed"

---

### STEP 5: Verify Real-time Updates

1. **Check Customer Notifications**
   - Logged in as customer
   - Should see notifications for each status change:
     - "Your order has been accepted"
     - "Driver is on the way"
     - "Order delivered"

2. **Check Restaurant Notifications**
   - Logged in as restaurant owner
   - Should see notifications for order status changes

3. **Check Driver Notifications**
   - Logged in as driver
   - Should see order assignment notifications

4. **Order Tracking Page**
   - Customer can view real-time status
   - Should see all status updates

---

## API Endpoints for Testing

### Customer Endpoints
```
POST /api/trpc/order.create
Body: {
  restaurantId: number,
  deliveryAddress: string,
  paymentMethod: string,
  cartItems: [{menuItemId, name, price, quantity}],
  tip?: number
}
```

### Restaurant Endpoints
```
GET /api/trpc/order.getByRestaurant  (requires restaurant owner auth)
POST /api/trpc/order.updateStatus   (requires restaurant owner auth)
```

### Driver Endpoints
```
GET /api/trpc/driver.getAvailableOrders  (requires driver auth)
POST /api/trpc/driver.acceptDelivery     (requires driver auth)
POST /api/trpc/driver.updateLocation     (requires driver auth)
```

### Common Endpoints
```
GET /api/trpc/order.getById?input={"id": orderId}
GET /api/trpc/notification.getAll
GET /api/trpc/notification.getUnreadCount
```

---

## Troubleshooting

### Order Creation Fails
- **Check**: Is the customer logged in?
- **Check**: Are there items in the cart?
- **Check**: Is the restaurant ID valid?
- **Check**: Is the database connected?

### Restaurant Can't See Orders
- **Check**: Is the restaurant owner account linked to the restaurant?
- **Check**: Is the restaurant approved and active?
- **Check**: Is the user logged in as the restaurant owner?

### Driver Can't Accept Orders
- **Check**: Is the driver account approved?
- **Check**: Is there an order in "ready_for_pickup" status?
- **Check**: Does the driver have an active status?

### Real-time Updates Not Working
- **Check**: Is the user logged in?
- **Check**: Are there notifications in the database?
- **Check**: Is the polling mechanism working?

---

## Expected Order Status Flow

```
pending → accepted → preparing → ready_for_pickup → 
driver_assigned → picked_up → out_for_delivery → 
delivered → customer_confirmed
```

---

## Manual Database Verification

You can check the database directly:

### Check Orders
```sql
SELECT * FROM orders ORDER BY createdAt DESC LIMIT 10;
```

### Check Order Status History
```sql
SELECT * FROM orderStatusHistory WHERE orderId = ? ORDER BY timestamp;
```

### Check Notifications
```sql
SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC;
```

---

## Test Summary Checklist

- [ ] Customer can browse restaurants
- [ ] Customer can add items to cart
- [ ] Customer can place order
- [ ] Restaurant sees pending order
- [ ] Restaurant can accept order
- [ ] Driver can see available orders
- [ ] Driver can accept delivery
- [ ] Driver can update location
- [ ] Driver can mark as delivered
- [ ] Customer receives notifications
- [ ] All parties see updated status