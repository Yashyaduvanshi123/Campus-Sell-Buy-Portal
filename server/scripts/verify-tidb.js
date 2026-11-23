const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { pool } = require('../config/db');

(async () => {
  console.log('\n========================================');
  console.log('   TiDB Cloud Connection Verification   ');
  console.log('========================================');

  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || '3306';
  const dbName = process.env.DB_NAME || 'campus_sell_buy';
  const isSSL = process.env.DB_SSL === 'true';

  console.log(`Target Host    : ${host}`);
  console.log(`Target Port    : ${port}`);
  console.log(`Database Name  : ${dbName}`);
  console.log(`SSL / TLS Mode : ${isSSL ? 'ENABLED (TLSv1.2)' : 'DISABLED (Standard)'}`);
  if (process.env.DB_CA_PATH) {
    console.log(`CA Cert Path   : ${process.env.DB_CA_PATH}`);
  }
  console.log('----------------------------------------');

  try {
    // 1. Read-only ping test: SELECT 1
    console.log('Step 1: Running ping query (SELECT 1)...');
    const [pingResult] = await pool.query('SELECT 1 AS connection_test');
    if (pingResult && pingResult[0]?.connection_test === 1) {
      console.log('✅ Step 1 SUCCESS: Ping verified! Database responded.');
    }

    // 2. Query table count from information_schema
    console.log('\nStep 2: Checking table count in schema...');
    const [countRows] = await pool.query(
      'SELECT COUNT(*) AS total_tables FROM information_schema.tables WHERE table_schema = ?',
      [dbName]
    );
    const totalTables = countRows[0]?.total_tables || 0;
    console.log(`✅ Step 2 SUCCESS: Found ${totalTables} table(s) in schema "${dbName}".`);

    // 3. Verify all 9 expected tables
    console.log('\nStep 3: Verifying expected table names...');
    const [tableRows] = await pool.query(
      'SELECT table_name FROM information_schema.tables WHERE table_schema = ? ORDER BY table_name ASC',
      [dbName]
    );

    const actualTables = tableRows.map(r => r.TABLE_NAME || r.table_name);

    const expectedTables = [
      'cart_items',
      'categories',
      'favourites',
      'inquiries',
      'inquiry_messages',
      'product_images',
      'products',
      'reports',
      'users'
    ];

    console.log('\nExpected Tables Status:');
    let allPresent = true;
    expectedTables.forEach(t => {
      const exists = actualTables.includes(t);
      if (exists) {
        console.log(`  [✓] ${t}`);
      } else {
        console.log(`  [✗] ${t} (MISSING)`);
        allPresent = false;
      }
    });

    console.log('----------------------------------------');
    if (allPresent && actualTables.length >= 9) {
      console.log('🎉 RESULT: TiDB Cloud connection verified successfully! All 9 tables are intact.');
    } else {
      console.log(`⚠️ RESULT: Connected, but found ${actualTables.length} tables (expected 9).`);
    }

    process.exit(allPresent ? 0 : 1);
  } catch (error) {
    console.error('\n❌ Connection Error:');
    console.error(`Message : ${error.message}`);
    console.error(`Code    : ${error.code || 'UNKNOWN'}`);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('Hint    : Double check your TiDB username and password in server/.env.');
    } else if (error.message && error.message.includes('SSL') || error.message.includes('handshake')) {
      console.error('Hint    : Check if TiDB CA certificate is required or verify DB_CA_PATH.');
    }
    process.exit(1);
  }
})();
