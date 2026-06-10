# Firebase Configuration & Firestore Security Rules

## Firebase Project Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a new project"
3. Enter project name: `zimbites`
4. Enable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Required Services

In Firebase Console, enable these services:

- **Authentication**: Email/Password, Google Sign-In, Phone Authentication
- **Firestore Database**: Create in production mode
- **Cloud Storage**: For restaurant and menu images
- **Cloud Functions**: For backend logic
- **Cloud Messaging**: For push notifications
- **Realtime Database**: For real-time updates (optional)

### 3. Configure Authentication

#### Email/Password
1. Go to Authentication → Sign-in method
2. Enable Email/Password provider
3. Enable Email link sign-in (optional)

#### Google Sign-In
1. Enable Google provider
2. Add OAuth consent screen
3. Add test users if in development

#### Phone Authentication
1. Enable Phone provider
2. Configure reCAPTCHA

### 4. Create Firestore Database

1. Go to Firestore Database
2. Click "Create database"
3. Select "Start in production mode"
4. Choose region (closest to Zimbabwe: `europe-west1` or `us-central1`)
5. Click "Create"

### 5. Configure Cloud Storage

1. Go to Cloud Storage
2. Click "Create bucket"
3. Name: `zimbites-storage`
4. Choose region
5. Set access control to "Uniform"

### 6. Set Up Cloud Functions

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize functions
firebase init functions

# Select your project
# Choose TypeScript
# Install dependencies
```

## Firestore Collections Structure

### users
```json
{
  "uid": "user-id",
  "name": "User Name",
  "email": "user@example.com",
  "phoneNumber": "+263771234567",
  "role": "customer",
  "profileImage": "gs://bucket/images/user-id.jpg",
  "address": "123 Main Street, Harare",
  "latitude": "-17.8252",
  "longitude": "31.0335",
  "createdAt": "2026-06-01T10:30:00Z",
  "updatedAt": "2026-06-01T10:30:00Z"
}
```

### restaurants
```json
{
  "id": "restaurant-id",
  "ownerId": "user-id",
  "name": "Restaurant Name",
  "description": "Delicious food",
  "imageUrl": "gs://bucket/images/restaurant-id.jpg",
  "address": "456 Business Ave, Harare",
  "location": {
    "latitude": "-17.8252",
    "longitude": "31.0335"
  },
  "phoneNumber": "+263771234567",
  "deliveryRadius": 15,
  "minOrderAmount": 0,
  "isApproved": true,
  "isActive": true,
  "averageRating": 4.5,
  "totalReviews": 120,
  "createdAt": "2026-06-01T10:30:00Z",
  "updatedAt": "2026-06-01T10:30:00Z"
}
```

### restaurants/{restaurantId}/menuCategories
```json
{
  "id": "category-id",
  "name": "Main Courses",
  "description": "Our main dishes",
  "imageUrl": "gs://bucket/images/category-id.jpg",
  "displayOrder": 1,
  "isActive": true,
  "createdAt": "2026-06-01T10:30:00Z",
  "updatedAt": "2026-06-01T10:30:00Z"
}
```

### restaurants/{restaurantId}/menuItems
```json
{
  "id": "item-id",
  "categoryId": "category-id",
  "name": "Grilled Chicken",
  "description": "Tender grilled chicken with vegetables",
  "price": 5000,
  "imageUrl": "gs://bucket/images/item-id.jpg",
  "preparationTime": 15,
  "isAvailable": true,
  "createdAt": "2026-06-01T10:30:00Z",
  "updatedAt": "2026-06-01T10:30:00Z"
}
```

### orders
```json
{
  "id": "order-id",
  "customerId": "user-id",
  "restaurantId": "restaurant-id",
  "driverId": "driver-id",
  "orderNumber": "ORD-1717225800000-ABC123",
  "status": "in_transit",
  "items": [
    {
      "menuItemId": "item-id",
      "name": "Grilled Chicken",
      "quantity": 2,
      "price": 5000,
      "subtotal": 10000
    }
  ],
  "deliveryAddress": "789 Customer St, Harare",
  "deliveryLocation": {
    "latitude": "-17.8252",
    "longitude": "31.0335"
  },
  "subtotal": 10000,
  "deliveryFee": 500,
  "platformCommission": 1000,
  "tip": 200,
  "total": 11700,
  "paymentMethod": "ecocash",
  "paymentStatus": "completed",
  "paymentReference": "TXN123456789",
  "specialInstructions": "Extra sauce please",
  "estimatedDeliveryTime": "2026-06-01T11:00:00Z",
  "pickedUpAt": "2026-06-01T10:45:00Z",
  "deliveredAt": null,
  "createdAt": "2026-06-01T10:30:00Z",
  "updatedAt": "2026-06-01T10:45:00Z"
}
```

### drivers
```json
{
  "id": "driver-id",
  "userId": "user-id",
  "phoneNumber": "+263771234567",
  "vehicleType": "motorcycle",
  "licensePlate": "ABC123",
  "status": "on_delivery",
  "currentLocation": {
    "latitude": "-17.8252",
    "longitude": "31.0335"
  },
  "lastLocationUpdate": "2026-06-01T10:45:00Z",
  "isApproved": true,
  "totalDeliveries": 150,
  "averageRating": 4.8,
  "totalEarnings": 75000,
  "totalTips": 5000,
  "createdAt": "2026-06-01T10:30:00Z",
  "updatedAt": "2026-06-01T10:45:00Z"
}
```

### payments
```json
{
  "id": "payment-id",
  "orderId": "order-id",
  "amount": 11700,
  "method": "ecocash",
  "status": "completed",
  "reference": "TXN123456789",
  "transactionId": "TXN-2026-06-01-001",
  "metadata": {
    "provider": "econet",
    "accountNumber": "+263771234567"
  },
  "createdAt": "2026-06-01T10:30:00Z",
  "updatedAt": "2026-06-01T10:31:00Z"
}
```

### ratings
```json
{
  "id": "rating-id",
  "orderId": "order-id",
  "customerId": "user-id",
  "restaurantId": "restaurant-id",
  "driverId": "driver-id",
  "rating": 5,
  "comment": "Excellent service and delicious food!",
  "ratedAt": "2026-06-01T11:30:00Z",
  "createdAt": "2026-06-01T11:30:00Z"
}
```

## Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return request.auth != null && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    function isOwner(uid) {
      return request.auth.uid == uid;
    }
    
    function isRestaurantOwner(restaurantId) {
      return request.auth != null && 
             get(/databases/$(database)/documents/restaurants/$(restaurantId)).data.ownerId == request.auth.uid;
    }
    
    function isDriver(driverId) {
      return request.auth != null && 
             get(/databases/$(database)/documents/drivers/$(driverId)).data.userId == request.auth.uid;
    }

    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated() && (isOwner(userId) || isAdmin());
      allow create: if isAuthenticated() && isOwner(userId);
      allow update: if isAuthenticated() && isOwner(userId);
      allow delete: if isAdmin();
    }

    // Restaurants collection
    match /restaurants/{restaurantId} {
      allow read: if true; // Public read
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && isRestaurantOwner(restaurantId);
      allow delete: if isAdmin();

      // Menu categories subcollection
      match /menuCategories/{categoryId} {
        allow read: if true;
        allow create, update: if isRestaurantOwner(restaurantId);
        allow delete: if isRestaurantOwner(restaurantId) || isAdmin();
      }

      // Menu items subcollection
      match /menuItems/{itemId} {
        allow read: if true;
        allow create, update: if isRestaurantOwner(restaurantId);
        allow delete: if isRestaurantOwner(restaurantId) || isAdmin();
      }
    }

    // Orders collection
    match /orders/{orderId} {
      allow read: if isAuthenticated() && 
                     (resource.data.customerId == request.auth.uid ||
                      resource.data.driverId == get(/databases/$(database)/documents/drivers/$(resource.data.driverId)).data.userId ||
                      isAdmin());
      
      allow create: if isAuthenticated() && 
                       request.resource.data.customerId == request.auth.uid;
      
      allow update: if isAuthenticated() && 
                       (resource.data.customerId == request.auth.uid ||
                        resource.data.driverId == get(/databases/$(database)/documents/drivers/$(resource.data.driverId)).data.userId ||
                        isRestaurantOwner(resource.data.restaurantId) ||
                        isAdmin());
      
      allow delete: if isAdmin();
    }

    // Drivers collection
    match /drivers/{driverId} {
      allow read: if isAuthenticated() && 
                     (isOwner(resource.data.userId) || isAdmin());
      
      allow create: if isAuthenticated();
      
      allow update: if isAuthenticated() && 
                       (isOwner(resource.data.userId) || isAdmin());
      
      allow delete: if isAdmin();
    }

    // Payments collection
    match /payments/{paymentId} {
      allow read: if isAuthenticated() && 
                     (isOwner(get(/databases/$(database)/documents/orders/$(resource.data.orderId)).data.customerId) ||
                      isAdmin());
      
      allow create: if isAuthenticated();
      
      allow update: if isAdmin();
      
      allow delete: if isAdmin();
    }

    // Ratings collection
    match /ratings/{ratingId} {
      allow read: if true;
      
      allow create: if isAuthenticated() && 
                       request.resource.data.customerId == request.auth.uid;
      
      allow update: if isAuthenticated() && 
                       resource.data.customerId == request.auth.uid;
      
      allow delete: if isAuthenticated() && 
                       (resource.data.customerId == request.auth.uid || isAdmin());
    }

    // Wallets collection
    match /wallets/{walletId} {
      allow read: if isAuthenticated() && 
                     (isOwner(resource.data.userId) || isAdmin());
      
      allow write: if isAdmin();
    }

    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Cloud Functions

### Order Status Update Trigger

```typescript
// functions/src/index.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

// Trigger on order status update
export const onOrderStatusUpdate = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const previousData = change.before.data();

    if (newData.status !== previousData.status) {
      const orderId = context.params.orderId;

      // Get customer and driver info
      const customerDoc = await db.collection('users').doc(newData.customerId).get();
      const driverDoc = newData.driverId 
        ? await db.collection('drivers').doc(newData.driverId).get()
        : null;

      // Send notifications
      const notifications = [];

      // Notify customer
      if (customerDoc.exists && customerDoc.data()?.fcmToken) {
        notifications.push(
          messaging.send({
            token: customerDoc.data()?.fcmToken,
            notification: {
              title: 'Order Status Updated',
              body: `Your order is now ${newData.status}`,
            },
            data: {
              orderId,
              status: newData.status,
            },
          })
        );
      }

      // Notify driver if assigned
      if (driverDoc?.exists && driverDoc.data()?.fcmToken) {
        notifications.push(
          messaging.send({
            token: driverDoc.data()?.fcmToken,
            notification: {
              title: 'Delivery Status',
              body: `Order ${newData.orderNumber} is ${newData.status}`,
            },
            data: {
              orderId,
              status: newData.status,
            },
          })
        );
      }

      await Promise.all(notifications);
    }
  });

// Calculate driver earnings when order is delivered
export const onOrderDelivered = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const previousData = change.before.data();

    if (newData.status === 'delivered' && previousData.status !== 'delivered') {
      const driverId = newData.driverId;
      if (!driverId) return;

      const driverRef = db.collection('drivers').doc(driverId);
      const walletRef = db.collection('wallets').doc(driverId);

      // Calculate driver earnings
      const driverEarnings = newData.deliveryFee;
      const driverTip = newData.tip || 0;
      const totalEarnings = driverEarnings + driverTip;

      // Update driver stats
      await driverRef.update({
        totalDeliveries: admin.firestore.FieldValue.increment(1),
        totalEarnings: admin.firestore.FieldValue.increment(totalEarnings),
      });

      // Update wallet
      await walletRef.update({
        availableBalance: admin.firestore.FieldValue.increment(totalEarnings),
        totalEarnings: admin.firestore.FieldValue.increment(totalEarnings),
        totalTips: admin.firestore.FieldValue.increment(driverTip),
      });
    }
  });

// Process payment confirmation
export const confirmPayment = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const { orderId, paymentMethod, reference } = data;

  // Verify payment with provider
  const paymentValid = await verifyPayment(paymentMethod, reference);

  if (!paymentValid) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Invalid payment reference'
    );
  }

  // Update order
  await db.collection('orders').doc(orderId).update({
    paymentStatus: 'completed',
    paymentReference: reference,
    status: 'confirmed',
  });

  return { success: true };
});

// Helper function to verify payment
async function verifyPayment(method: string, reference: string): Promise<boolean> {
  // Implement payment verification logic for each provider
  // This is a placeholder - actual implementation depends on provider APIs
  return true;
}
```

### Deploy Cloud Functions

```bash
# Navigate to functions directory
cd functions

# Deploy functions
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:onOrderStatusUpdate
```

## Environment Configuration

### Firebase Config for Flutter

```dart
// lib/firebase_options.dart
import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart' show defaultTargetPlatform, TargetPlatform;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (defaultTargetPlatform == TargetPlatform.android) {
      return android;
    }
    if (defaultTargetPlatform == TargetPlatform.iOS) {
      return ios;
    }
    throw UnsupportedError(
      'DefaultFirebaseOptions are not supported for this platform.',
    );
  }

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxx',
    appId: '1:123456789:android:xxxxxxxxxxxxxxxx',
    messagingSenderId: '123456789',
    projectId: 'zimbites',
    storageBucket: 'zimbites.appspot.com',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxx',
    appId: '1:123456789:ios:xxxxxxxxxxxxxxxx',
    messagingSenderId: '123456789',
    projectId: 'zimbites',
    storageBucket: 'zimbites.appspot.com',
    iosBundleId: 'com.zimbites.app',
  );
}
```

## Backup & Recovery

### Enable Automated Backups

1. Go to Firestore Database
2. Click "Backups"
3. Click "Create Schedule"
4. Set frequency (daily recommended)
5. Set retention period (30 days minimum)

### Manual Backup

```bash
# Export Firestore data
gcloud firestore export gs://zimbites-backups/backup-2026-06-01

# Import Firestore data
gcloud firestore import gs://zimbites-backups/backup-2026-06-01
```

## Monitoring & Analytics

### Enable Google Analytics

1. Go to Project Settings
2. Enable Google Analytics
3. Create Analytics property
4. Link to Firebase

### Set Up Alerts

1. Go to Cloud Monitoring
2. Create notification channels
3. Set up alerts for:
   - High error rates
   - High latency
   - Quota exceeded
   - Database size

---

This Firebase configuration provides a secure, scalable backend for the Zimbites platform with proper security rules, real-time updates, and production-ready infrastructure.
