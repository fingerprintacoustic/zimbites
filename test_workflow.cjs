const mysql = require('mysql2/promise');
const crypto = require('crypto');

async function testWorkflow() {
  const connection = await mysql.createConnection({
    host: 'gateway01.us-east-1.prod.aws.tidbcloud.com',
    port: 4000,
    user: '4V16oiuF4Ax9FhA.root',
    password: 'fZSBKYlW97e6vjKS',
    database: 'test',
    ssl: { rejectUnauthorized: true }
  });

  console.log('========================================');
  console.log('ZIMBITES END-TO-END WORKFLOW TEST');
  console.log('========================================\n');

  // Test data
  const customerId = 570004;
  const restaurantId = 390001;
  const driverId = 390001;
  const menuItemIds = [390001, 390002, 390003, 390004, 390005, 390006, 390007, 390008, 390009];

  try {
    // STEP 1: Create cart for customer
    console.log('STEP 1: Creating cart...');
    let cartId;
    try {
      const [cartResult] = await connection.execute(
        'INSERT INTO carts (customerId) VALUES (?)',
        [customerId]
      );
      cartId = cartResult.insertId;
      console.log(`✓ Cart created (ID: ${cartId})`);
    } catch (err) {
      if (err.message.includes('Duplicate')) {
        const [rows] = await connection.execute('SELECT id FROM carts WHERE customerId = ?', [customerId]);
        cartId = rows[0]?.id;
        console.log(`✓ Cart exists (ID: ${cartId})`);
      } else throw err;
    }

    // Add items to cart
    console.log('\nSTEP 2: Adding items to cart...');
    await connection.execute('DELETE FROM cart_items WHERE cartId = ?', [cartId]);
    const items = [
      { id: menuItemIds[0], quantity: 2, price: 850 },  // Crispy Calamari
      { id: menuItemIds[3], quantity: 1, price: 2500 }, // Grilled Steak
      { id: menuItemIds[6], quantity: 2, price: 400 }, // Fresh Juice
    ];
    for (const item of items) {
      await connection.execute(
        'INSERT INTO cart_items (cartId, menuItemId, quantity, price) VALUES (?, ?, ?, ?)',
        [cartId, item.id, item.quantity, item.price]
      );
      console.log(`  ✓ Added item ${item.id} x${item.quantity} - ZWL ${(item.price * item.quantity)/100}`);
    }

    // Calculate totals
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const deliveryFee = 500;
    const tax = Math.floor(subtotal * 0.1);
    const total = subtotal + deliveryFee + tax;

    // STEP 3: Create order
    console.log('\nSTEP 3: Creating order...');
    const orderNumber = 'ORD-' + Date.now().toString().slice(-8);
    const [orderResult] = await connection.execute(
      `INSERT INTO orders (customerId, restaurantId, orderNumber, status, deliveryAddress, 
        subtotal, deliveryFee, tax, total, paymentMethod, paymentStatus) 
       VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, ?, 'cash_on_delivery', 'pending')`,
      [customerId, restaurantId, orderNumber, '123 Customer Street, Harare', subtotal, deliveryFee, tax, total]
    );
    const orderId = orderResult.insertId;
    console.log(`✓ Order created: ${orderNumber} (ID: ${orderId})`);
    console.log(`  Total: ZWL ${total/100}`);

    // Add order items
    for (const item of items) {
      await connection.execute(
        'INSERT INTO order_items (orderId, menuItemId, name, quantity, price, total) VALUES (?, ?, ?, ?, ?, ?)',
        [orderId, item.id, `Item ${item.id}`, item.quantity, item.price, item.price * item.quantity]
      );
    }
    console.log(`  ✓ ${items.length} items added to order`);

    // Add status history
    await connection.execute(
      'INSERT INTO orders_status_history (orderId, status, notes) VALUES (?, ?, ?)',
      [orderId, 'pending', 'Order placed by customer']
    );

    // STEP 4: Restaurant accepts order
    console.log('\nSTEP 4: Restaurant accepts order...');
    await connection.execute(
      'UPDATE orders SET status = ? WHERE id = ?',
      ['confirmed', orderId]
    );
    await connection.execute(
      'INSERT INTO orders_status_history (orderId, status, notes) VALUES (?, ?, ?)',
      [orderId, 'confirmed', 'Order accepted by restaurant']
    );
    console.log(`✓ Order confirmed by restaurant`);

    // STEP 5: Restaurant starts preparing
    console.log('\nSTEP 5: Restaurant starts preparing...');
    await connection.execute(
      'UPDATE orders SET status = ? WHERE id = ?',
      ['preparing', orderId]
    );
    await connection.execute(
      'INSERT INTO orders_status_history (orderId, status, notes) VALUES (?, ?, ?)',
      [orderId, 'preparing', 'Kitchen is preparing your order']
    );
    console.log(`✓ Order is being prepared`);

    // STEP 6: Restaurant marks ready for pickup
    console.log('\nSTEP 6: Restaurant marks ready for pickup...');
    await connection.execute(
      'UPDATE orders SET status = ? WHERE id = ?',
      ['ready', orderId]
    );
    await connection.execute(
      'INSERT INTO orders_status_history (orderId, status, notes) VALUES (?, ?, ?)',
      [orderId, 'ready', 'Order ready for driver pickup']
    );
    console.log(`✓ Order ready for pickup`);

    // STEP 7: Driver accepts delivery
    console.log('\nSTEP 7: Driver accepts delivery...');
    await connection.execute(
      'INSERT INTO driver_assignments (orderId, driverId, status, acceptedAt) VALUES (?, ?, ?, NOW())',
      [orderId, driverId, 'accepted']
    );
    await connection.execute(
      'UPDATE orders SET driverId = ?, status = ? WHERE id = ?',
      [570003, 'picked_up', orderId]
    );
    await connection.execute(
      'INSERT INTO orders_status_history (orderId, status, notes) VALUES (?, ?, ?)',
      [orderId, 'picked_up', 'Driver picked up the order']
    );
    console.log(`✓ Driver assigned and picked up order`);

    // STEP 8: Driver is on the way
    console.log('\nSTEP 8: Driver is on the way...');
    await connection.execute(
      'UPDATE orders SET status = ? WHERE id = ?',
      ['in_transit', orderId]
    );
    await connection.execute(
      'INSERT INTO orders_status_history (orderId, status, notes) VALUES (?, ?, ?)',
      [orderId, 'in_transit', 'Order is on its way to you']
    );
    console.log(`✓ Order in transit`);

    // STEP 9: Driver completes delivery
    console.log('\nSTEP 9: Driver completes delivery...');
    await connection.execute(
      'UPDATE orders SET status = ?, deliveredAt = NOW() WHERE id = ?',
      ['delivered', orderId]
    );
    await connection.execute(
      'UPDATE driver_assignments SET status = ?, deliveredAt = NOW() WHERE orderId = ?',
      ['completed', orderId]
    );
    await connection.execute(
      'INSERT INTO orders_status_history (orderId, status, notes) VALUES (?, ?, ?)',
      [orderId, 'delivered', 'Order delivered successfully']
    );
    console.log(`✓ Order delivered!`);

    // STEP 10: Payment completed (cash on delivery)
    console.log('\nSTEP 10: Payment completed...');
    await connection.execute(
      'INSERT INTO payments (orderId, amount, method, status, reference) VALUES (?, ?, ?, ?, ?)',
      [orderId, total, 'cash_on_delivery', 'completed', 'COD-' + orderId]
    );
    await connection.execute(
      'UPDATE orders SET paymentStatus = ? WHERE id = ?',
      ['completed', orderId]
    );
    console.log(`✓ Payment completed (Cash on Delivery)`);

    // Final order status
    console.log('\n========================================');
    console.log('WORKFLOW TEST COMPLETE!');
    console.log('========================================\n');

    // Show final order status
    const [order] = await connection.execute('SELECT * FROM orders WHERE id = ?', [orderId]);
    console.log('Final Order Status:');
    console.log(`  Order Number: ${order[0].orderNumber}`);
    console.log(`  Status: ${order[0].status}`);
    console.log(`  Total: ZWL ${order[0].total/100}`);
    console.log(`  Payment: ${order[0].paymentStatus}`);

    // Show order history
    const [history] = await connection.execute(
      'SELECT * FROM orders_status_history WHERE orderId = ? ORDER BY timestamp',
      [orderId]
    );
    console.log('\nOrder Timeline:');
    history.forEach(h => {
      console.log(`  [${h.timestamp.toISOString()}] ${h.status}: ${h.notes}`);
    });

  } catch (err) {
    console.error('\n❌ ERROR:', err.message);
    console.error(err.stack);
  } finally {
    await connection.end();
  }
}

testWorkflow().catch(console.error);