const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'campus_sell_buy',
};

async function updateSchema() {
  console.log('🔄 Checking and applying minimal schema updates for threaded replies and WhatsApp option...');
  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);

    // 1. Check if allow_whatsapp column exists on products
    const [cols] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'products' AND COLUMN_NAME = 'allow_whatsapp'
    `, [dbConfig.database]);

    if (cols.length === 0) {
      console.log('Adding `allow_whatsapp` column to `products` table...');
      await connection.query('ALTER TABLE products ADD COLUMN allow_whatsapp BOOLEAN DEFAULT FALSE AFTER campus');
      console.log('✅ Column `allow_whatsapp` added.');
    } else {
      console.log('ℹ️  Column `allow_whatsapp` already exists.');
    }

    // 2. Create inquiry_messages table for threaded buyer-seller communication
    console.log('Creating `inquiry_messages` table if not exists...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS inquiry_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        inquiry_id INT NOT NULL,
        sender_id INT NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_inq_msg_inquiry FOREIGN KEY (inquiry_id) REFERENCES inquiries(id) ON DELETE CASCADE,
        CONSTRAINT fk_inq_msg_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_inq_msg_inquiry (inquiry_id),
        INDEX idx_inq_msg_sender (sender_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ `inquiry_messages` table ready.');

    // 3. Migrate initial inquiry messages if any exist
    await connection.query(`
      INSERT INTO inquiry_messages (inquiry_id, sender_id, message, created_at)
      SELECT id, buyer_id, message, created_at FROM inquiries
      WHERE id NOT IN (SELECT DISTINCT inquiry_id FROM inquiry_messages)
    `);
    console.log('✅ Synchronized existing inquiry messages.');

    // Also opt-in some existing demo products (e.g. products 1 and 2) to WhatsApp sharing for demonstration
    await connection.query('UPDATE products SET allow_whatsapp = TRUE WHERE id IN (1, 2)');

    console.log('🎉 Schema update completed successfully!');
  } catch (err) {
    console.error('❌ Schema update error:', err.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

updateSchema();
