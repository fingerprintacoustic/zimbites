# Zimbites API Documentation

## Overview

Zimbites provides a comprehensive tRPC API for managing restaurants, drivers, orders, and payments. All endpoints are authenticated and role-based.

## Authentication

All requests require an Auth0 token in the Authorization header:

```
Authorization: Bearer <auth0_token>
```

## Core Routers

### 1. Restaurant Router

#### Create Restaurant

```typescript
POST /trpc/restaurant.create

Input:
{
  name: string
  description?: string
  address: string
  phoneNumber?: string
  latitude?: number
  longitude?: number
  minOrderAmount?: number (in cents)
  deliveryRadius?: number (in km)
  bankAccountName?: string
  bankAccountNumber?: string
  bankName?: string
  bankBranch?: string
}

Response:
{
  success: boolean
  restaurantId: number
}
```

#### Get Restaurant by ID

```typescript
GET /trpc/restaurant.getById?id=123

Response:
{
  id: number
  name: string
  description: string
  address: string
  latitude: string
  longitude: string
  phoneNumber: string
  minOrderAmount: number
  deliveryRadius: number
  isApproved: number
  isActive: number
  bankAccountName: string
  bankAccountNumber: string
  bankName: string
  bankBranch: string
  ownerId: number
  createdAt: Date
  updatedAt: Date
}
```

#### Get All Approved Restaurants

```typescript
GET /trpc/restaurant.getApproved

Response:
[
  { /* restaurant object */ },
  ...
]
```

### 2. Menu Router

#### Create Menu Item

```typescript
POST /trpc/menu.createItem

Input:
{
  restaurantId: number
  categoryId: number
  name: string
  description?: string
  price: number (in cents)
  currency: "USD" | "ZWL"
  image?: string
  isAvailable?: boolean
}

Response:
{
  success: boolean
  itemId: number
}
```

#### Get Menu by Restaurant

```typescript
GET /trpc/menu.getByRestaurant?restaurantId=123

Response:
{
  categories: [
    {
      id: number
      name: string
      items: [
        {
          id: number
          name: string
          description: string
          price: number
          currency: string
          image: string
          isAvailable: boolean
        }
      ]
    }
  ]
}
```

#### Update Menu Item

```typescript
POST /trpc/menu.updateItem

Input:
{
  itemId: number
  name?: string
  description?: string
  price?: number
  currency?: "USD" | "ZWL"
  isAvailable?: boolean
}

Response:
{
  success: boolean
}
```

#### Delete Menu Item

```typescript
POST /trpc/menu.deleteItem

Input:
{
  itemId: number
}

Response:
{
  success: boolean
}
```

### 3. Order Router

#### Create Order

```typescript
POST /trpc/order.create

Input:
{
  restaurantId: number
  items: [
    {
      menuItemId: number
      quantity: number
      price: number (in cents)
      currency: "USD" | "ZWL"
    }
  ]
  deliveryAddress: string
  deliveryLatitude: number
  deliveryLongitude: number
  specialInstructions?: string
  currency: "USD" | "ZWL"
}

Response:
{
  success: boolean
  orderId: number
  orderNumber: string
  total: number (in cents)
}
```

#### Get Order by ID

```typescript
GET /trpc/order.getById?id=123

Response:
{
  id: number
  orderNumber: string
  restaurantId: number
  customerId: number
  driverId?: number
  status: string
  items: [
    {
      menuItemId: number
      name: string
      quantity: number
      price: number
      currency: string
    }
  ]
  subtotal: number
  deliveryFee: number
  total: number
  currency: string
  deliveryAddress: string
  deliveryLatitude: string
  deliveryLongitude: string
  createdAt: Date
  updatedAt: Date
}
```

#### Get Orders by Restaurant

```typescript
GET /trpc/order.getByRestaurant

Response:
[
  { /* order object */ },
  ...
]
```

#### Update Order Status

```typescript
POST /trpc/order.updateStatus

Input:
{
  orderId: number
  status: "pending" | "confirmed" | "preparing" | "ready" | "picked_up" | "in_transit" | "delivered" | "cancelled"
}

Response:
{
  success: boolean
}
```

### 4. Driver Router

#### Register Driver

```typescript
POST /trpc/driver.register

Input:
{
  name: string
  phoneNumber: string
  licenseNumber: string
  vehicleType: "motorcycle" | "car" | "van"
  licensePlate: string
  vehicleColor?: string
  bankAccountName?: string
  bankAccountNumber?: string
  bankName?: string
  bankBranch?: string
  withdrawalMethod?: "bank_transfer" | "mobile_money" | "cash"
}

Response:
{
  success: boolean
  driverId: number
}
```

#### Get Driver Profile

```typescript
GET /trpc/driver.getProfile

Response:
{
  id: number
  userId: number
  name: string
  phoneNumber: string
  licenseNumber: string
  vehicleType: string
  licensePlate: string
  vehicleColor: string
  status: "offline" | "available"
  isApproved: number
  walletBalance: number (in cents)
  bankAccountName: string
  bankAccountNumber: string
  bankName: string
  bankBranch: string
  createdAt: Date
  updatedAt: Date
}
```

#### Update Driver Status

```typescript
POST /trpc/driver.updateStatus

Input:
{
  status: "available" | "offline"
}

Response:
{
  success: boolean
}
```

### 5. GPS Router

#### Update Location

```typescript
POST /trpc/gps.updateLocation

Input:
{
  assignmentId: number
  latitude: number (-90 to 90)
  longitude: number (-180 to 180)
  accuracy?: number (in meters)
}

Response:
{
  success: boolean
}
```

#### Get Delivery Route

```typescript
GET /trpc/gps.getDeliveryRoute?assignmentId=123

Response:
{
  driverLocation: {
    latitude: number
    longitude: number
    timestamp: Date
  }
  restaurantLocation: {
    latitude: number
    longitude: number
    timestamp: Date
  }
  customerLocation: {
    latitude: number
    longitude: number
    timestamp: Date
  }
  distanceToRestaurant: number (in meters)
  distanceToCustomer: number (in meters)
  etaToRestaurant: number (in seconds)
  etaToCustomer: number (in seconds)
  atRestaurant: boolean
  atCustomer: boolean
}
```

#### Get Driver Location (for tracking)

```typescript
GET /trpc/gps.getDriverLocation?orderId=123

Response:
{
  latitude: number
  longitude: number
  timestamp: Date
  accuracy: number
}
```

### 6. Financial Router

#### Update Restaurant Bank Account

```typescript
POST /trpc/financial.updateRestaurantBankAccount

Input:
{
  restaurantId: number
  bankAccountName: string
  bankAccountNumber: string
  bankName: string
  bankBranch: string
}

Response:
{
  success: boolean
}
```

#### Update Driver Bank Account

```typescript
POST /trpc/financial.updateDriverBankAccount

Input:
{
  driverId: number
  bankAccountName: string
  bankAccountNumber: string
  bankName: string
  bankBranch: string
  withdrawalMethod: "bank_transfer" | "mobile_money" | "cash"
}

Response:
{
  success: boolean
}
```

#### Request Payout

```typescript
POST /trpc/financial.requestPayout

Input:
{
  amount: number (in currency units, not cents)
  currency: "USD" | "ZWL"
  payoutMethod: "bank_transfer" | "mobile_money" | "cash"
  notes?: string
}

Response:
{
  id: number
  amount: number
  currency: string
  status: "pending"
  createdAt: Date
}
```

#### Get Payouts

```typescript
GET /trpc/financial.getRestaurantPayouts?restaurantId=123
GET /trpc/financial.getDriverPayouts?driverId=123

Response:
[
  {
    id: number
    amount: number (in cents)
    currency: string
    status: "pending" | "processing" | "completed" | "failed"
    payoutMethod: string
    createdAt: Date
    completedAt?: Date
  }
]
```

### 7. Admin Router

#### Get Platform Statistics

```typescript
GET /trpc/admin.getStats

Query Parameters:
- startDate?: Date (ISO format)
- endDate?: Date (ISO format)

Response:
{
  totalOrders: number
  totalRevenue: number (in cents)
  totalRestaurants: number
  totalDrivers: number
  totalCustomers: number
  averageOrderValue: number
  averageDeliveryTime: number (in minutes)
}
```

#### Approve Restaurant

```typescript
POST /trpc/admin.approveRestaurant

Input:
{
  restaurantId: number
}

Response:
{
  success: boolean
}
```

#### Reject Restaurant

```typescript
POST /trpc/admin.rejectRestaurant

Input:
{
  restaurantId: number
  reason?: string
}

Response:
{
  success: boolean
}
```

#### Approve Driver

```typescript
POST /trpc/admin.approveDriver

Input:
{
  driverId: number
}

Response:
{
  success: boolean
}
```

#### Reject Driver

```typescript
POST /trpc/admin.rejectDriver

Input:
{
  driverId: number
  reason?: string
}

Response:
{
  success: boolean
}
```

#### Get Pending Restaurants

```typescript
GET /trpc/admin.getPendingRestaurants

Response:
[
  { /* restaurant object with isApproved: 0 */ }
]
```

#### Get Pending Drivers

```typescript
GET /trpc/admin.getPendingDrivers

Response:
[
  { /* driver object with isApproved: 0 */ }
]
```

## Error Handling

All errors follow the tRPC error format:

```typescript
{
  code: "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "BAD_REQUEST" | "INTERNAL_SERVER_ERROR"
  message: string
}
```

## Rate Limiting

- 100 requests per minute per user
- 1000 requests per minute per IP

## Pagination

List endpoints support pagination:

```
?limit=50&offset=0
```

## Webhooks

Webhooks are sent for:
- Order status changes
- Driver assignment changes
- Payment completion
- Payout processing

Configure webhook URL in admin dashboard.

---

**API Version**: 1.0  
**Last Updated**: June 2026
