import { getOrdersByRestaurant } from './server/db';

async function run() {
  try {
    console.log('Querying orders for restaurant 360002...');
    const orders = await getOrdersByRestaurant(360002);
    console.log(`Found ${orders.length} orders`);
    orders.forEach((order: any) => {
      console.log(`- Order #${order.orderNumber}: Customer ${order.customerId}, Status: ${order.status}`);
    });
  } catch (error) {
    console.error('Error:', error);
  }
  process.exit(0);
}

run();
