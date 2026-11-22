const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'campus_sell_buy',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  dateStrings: true
});

// Test connection helper
const testConnection = async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✅ MySQL Database Connected successfully to database: ' + (process.env.DB_NAME || 'campus_sell_buy'));
    conn.release();
    return true;
  } catch (error) {
    console.error('⚠️  MySQL Connection Notice:', error.message);
    if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('💡 Tip: Run `npm run init-db` inside the server directory to create the `campus_sell_buy` database.');
    }
    return false;
  }
};

module.exports = {
  pool,
  testConnection
};
