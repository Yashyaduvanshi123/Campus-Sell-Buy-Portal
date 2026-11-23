const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const isSSL = process.env.DB_SSL === 'true';

const poolConfig = {
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
};

if (isSSL) {
  const sslConfig = {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
  };

  // Support custom CA certificate file path (TiDB CA certificate)
  if (process.env.DB_CA_PATH) {
    const resolvedCaPath = path.isAbsolute(process.env.DB_CA_PATH)
      ? process.env.DB_CA_PATH
      : path.join(__dirname, '..', process.env.DB_CA_PATH);

    if (fs.existsSync(resolvedCaPath)) {
      sslConfig.ca = fs.readFileSync(resolvedCaPath);
    } else {
      console.warn(`⚠️  DB_CA_PATH specified (${resolvedCaPath}) but file was not found. Using system trust store.`);
    }
  } else if (process.env.DB_CA_CERT) {
    // Support raw certificate string in env (ideal for cloud platforms like Render)
    sslConfig.ca = process.env.DB_CA_CERT;
  }

  poolConfig.ssl = sslConfig;
}

const pool = mysql.createPool(poolConfig);

// Test connection helper
const testConnection = async () => {
  try {
    const conn = await pool.getConnection();
    const sslStatus = isSSL ? ' (TiDB / SSL enabled)' : ' (Standard)';
    console.log('✅ Database Connected successfully to: ' + (process.env.DB_NAME || 'campus_sell_buy') + sslStatus);
    conn.release();
    return true;
  } catch (error) {
    console.error('⚠️  Database Connection Error:', error.message);
    if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('💡 Tip: Run `npm run init-db` inside the server directory to create the database.');
    }
    return false;
  }
};

module.exports = {
  pool,
  testConnection
};
