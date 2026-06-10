# Zimbites Testing Guide

## Demo Account Credentials

### Customer Accounts
```
Email: customer@zimbites.test
Password: demo123456

Email: customer2@zimbites.test
Password: demo123456
```

### Restaurant Owner Accounts
```
Email: restaurant@zimbites.test
Password: demo123456

Email: restaurant2@zimbites.test
Password: demo123456
```

### Driver Accounts
```
Email: driver@zimbites.test
Password: demo123456

Email: driver2@zimbites.test
Password: demo123456
```

### Admin Account
```
Email: admin@zimbites.test
Password: demo123456
```

## Application Routes

### Customer App
- **Home Page**: `/home` - Browse restaurants and search
- **Restaurant Details**: `/restaurant/:id` - View menu and add items to cart
- **Checkout**: `/checkout` - Complete order with payment method selection
- **Order Tracking**: `/order/:id` - Real-time order status tracking
- **Order History**: `/orders` - View all past orders
- **User Profile**: `/profile` - Manage account and settings
- **Rate Order**: `/rate-order/:id` - Submit ratings and reviews

### Restaurant Portal
- **Dashboard**: `/restaurant-dashboard` - Overview and recent orders
- **Menu Management**: `/menu-management` - Add/edit/delete menu items
- **Order Management**: `/order-management` - View and update order status
- **Analytics**: Built into dashboard

### Driver Dashboard
- **Dashboard**: `/driver-dashboard` - Overview and earnings
- **Delivery Management**: `/driver-delivery-dashboard` - Accept and manage deliveries

### Admin Dashboard
- **Dashboard**: `/admin-dashboard` - Platform overview
- **Platform Dashboard**: `/admin-platform-dashboard` - Full management interface

## Test Scenarios

### Scenario 1: Complete Customer Order Flow
1. **Browse Restaurants**
   - Navigate to `/home`
   - View restaurant list with search and filters
   - Click on a restaurant to view details

2. **Add Items to Cart**
   - Click on menu items to add to cart
   - Adjust quantities
   - View cart summary

3. **Checkout**
   - Navigate to `/checkout`
   - Enter delivery address
   - Select payment method (EcoCash, InnBucks, OneMoney, Omari, Bank Transfer, Cash)
   - Enter payment reference if required
   - Add tip (optional)
   - Place order

4. **Track Order**
   - View order confirmation
   - Navigate to `/order/:id` to track status
   - See real-time updates as restaurant prepares order
   - See driver assignment and location

5. **Rate Order**
   - After delivery, navigate to `/rate-order/:id`
   - Submit rating and review
   - View ratings history

### Scenario 2: Restaurant Owner Operations
1. **View Dashboard**
   - Navigate to `/restaurant-dashboard`
   - See today's orders and revenue
   - View recent orders

2. **Manage Menu**
   - Navigate to `/menu-management`
   - View all menu categories and items
   - Add new menu item with price and description
   - Edit existing items
   - Delete items

3. **Manage Orders**
   - Navigate to `/order-management`
   - View pending orders
   - Accept or reject orders
   - Update order status (preparing, ready, delivered)
   - View order details and customer info

### Scenario 3: Driver Operations
1. **View Available Deliveries**
   - Navigate to `/driver-delivery-dashboard`
   - See list of available deliveries
   - View distance, estimated time, and earnings

2. **Accept Delivery**
   - Click "Accept Delivery" on available order
   - View pickup and delivery locations
   - Call customer if needed
   - Navigate to pickup location

3. **Complete Delivery**
   - Mark as "Start Delivery"
   - Navigate to customer location
   - Mark as "Complete Delivery"
   - Receive payment

### Scenario 4: Admin Platform Management
1. **View Dashboard**
   - Navigate to `/admin-platform-dashboard`
   - See revenue, orders, restaurants, and drivers stats
   - View revenue and order trends

2. **Manage Restaurants**
   - View all restaurants
   - Approve pending restaurants
   - Reject restaurants if needed
   - View restaurant analytics

3. **Manage Drivers**
   - View all drivers
   - See driver performance metrics
   - View ratings and delivery count

4. **Configure Settings**
   - Set platform commission percentage
   - Set minimum order amount
   - Set delivery radius
   - Configure driver fees
   - Enable/disable payment methods

## Zimbabwe Payment Methods Testing

### EcoCash
- Select "EcoCash" payment method
- Enter payment reference (e.g., "123456")
- Confirm payment

### InnBucks
- Select "InnBucks" payment method
- Enter payment reference
- Confirm payment

### OneMoney
- Select "OneMoney" payment method
- Enter payment reference
- Confirm payment

### Omari
- Select "Omari" payment method
- Enter payment reference
- Confirm payment

### Bank Transfer
- Select "Bank Transfer" payment method
- View bank details
- Enter payment reference
- Confirm payment

### Cash on Delivery
- Select "Cash on Delivery"
- No payment reference needed
- Driver collects cash on delivery

## Test Data

### Sample Restaurants
1. **Burger Palace**
   - Categories: Burgers, Sides, Drinks
   - Items: Chicken Burger (ZWL 1,500), Beef Burger (ZWL 1,800), Fries (ZWL 800)

2. **Pizza Place**
   - Categories: Pizzas, Sides, Drinks
   - Items: Margherita Pizza (ZWL 2,500), Pepperoni Pizza (ZWL 2,800)

3. **Chicken Express**
   - Categories: Chicken, Sides, Drinks
   - Items: Fried Chicken (ZWL 2,200), Grilled Chicken (ZWL 2,500)

### Sample Orders
- Order 1: Chicken Burger x2 + Coca Cola x2 = ZWL 4,000
- Order 2: Margherita Pizza x1 = ZWL 2,500
- Order 3: Beef Burger x1 + Fries x1 = ZWL 2,600

## Performance Testing

### Load Testing
- Test with 100+ concurrent users
- Monitor response times
- Check database query performance
- Verify real-time updates

### Stress Testing
- Test with 1000+ orders per day
- Monitor system stability
- Check payment processing
- Verify driver allocation

## Security Testing

### Authentication
- Test login with invalid credentials
- Test session expiration
- Test role-based access control
- Test unauthorized access to admin pages

### Payment Security
- Test payment reference validation
- Test duplicate payment detection
- Test payment amount validation
- Test refund processing

### Data Security
- Test SQL injection prevention
- Test XSS prevention
- Test CSRF protection
- Test data encryption

## Browser Compatibility

### Tested Browsers
- Chrome 120+
- Firefox 121+
- Safari 17+
- Edge 120+

### Mobile Browsers
- Chrome Mobile
- Safari iOS
- Firefox Mobile

## Known Limitations

### Current MVP Features
- Mock data for demonstration
- Polling-based real-time updates (can be upgraded to WebSockets)
- Limited payment verification (reference-based)
- Basic driver allocation (no optimization)
- No image upload for menu items or delivery proof

### Future Enhancements
- Real-time WebSocket updates
- Advanced payment gateway integration
- AI-based driver allocation
- Image upload and verification
- Advanced analytics and reporting
- Mobile app deployment

## Troubleshooting

### Common Issues

**Issue**: Orders not appearing in restaurant dashboard
- **Solution**: Refresh the page, check if restaurant is approved

**Issue**: Payment reference not accepted
- **Solution**: Ensure reference format is correct (numbers only)

**Issue**: Driver not assigned to order
- **Solution**: Check if drivers are available and online

**Issue**: Real-time updates not working
- **Solution**: Check browser console for errors, refresh page

## Support

For issues or questions:
1. Check the DOCUMENTATION.md for API details
2. Review the DEPLOYMENT_GUIDE.md for setup instructions
3. Check browser console for error messages
4. Review server logs for backend errors

## Deployment Checklist

- [ ] All routes tested and working
- [ ] Demo accounts created
- [ ] Payment methods configured
- [ ] Database populated with test data
- [ ] Admin dashboard accessible
- [ ] Restaurant portal functional
- [ ] Driver dashboard operational
- [ ] Customer app complete
- [ ] Performance acceptable
- [ ] Security measures in place
- [ ] Documentation complete
- [ ] Ready for production deployment
