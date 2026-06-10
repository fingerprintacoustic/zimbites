const mysql = require('mysql2/promise');

async function checkSchema() {
  const connection = await mysql.createConnection({
    host: 'gateway01.us-east-1.prod.aws.tidbcloud.com',
    port: 4000,
    user: '4V16oiuF4Ax9FhA.root',
    password: 'fZSBKYlW97e6vjKS',
    database: 'test',
    ssl: { rejectUnauthorized: true }
  });

  console.log('Connected to TiDB');

  // Check users table schema
  const [usersCols] = await connection.execute('DESCRIBE users');
  console.log('\n--- USERS TABLE ---');
  console.log(usersCols.map(c => `${c.Field}: ${c.Type}`).join('\n'));

  // Check restaurants table schema
  const [restCols] = await connection.execute('DESCRIBE restaurants');
  console.log('\n--- RESTAURANTS TABLE ---');
  console.log(restCols.map(c => `${c.Field}: ${c.Type}`).join('\n'));

  // Check orders table schema
  const [orderCols] = await connection.execute('DESCRIBE orders');
  console.log('\n--- ORDERS TABLE ---');
  console.log(orderCols.map(c => `${c.Field}: ${c.Type}`).join('\n'));

  // List all tables
  const [tables] = await connection.execute('SHOW TABLES');
  console.log('\n--- TABLES ---');
  console.log(tables.map(t => Object.values(t)[0]).join('\n'));

  await connection.end();
}

checkSchema().catch(console.error);