const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true,
};

async function initializeDatabase() {
  console.log('🔄 Connecting to MySQL server...');
  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to MySQL server successfully.');

    const schemaPath = path.join(__dirname, '..', '..', 'database', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('🔄 Executing schema.sql to initialize database and tables...');
    await connection.query(schemaSql);
    console.log('✅ Database `campus_sell_buy` and tables created successfully.');

    // Switch to database
    await connection.changeUser({ database: process.env.DB_NAME || 'campus_sell_buy' });

    const seedPath = path.join(__dirname, '..', '..', 'database', 'seed.sql');
    if (fs.existsSync(seedPath)) {
      console.log('🔄 Seeding database with initial categories, admin, products and sample data...');
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      await connection.query(seedSql);
      console.log('✅ Database seeded successfully.');
    }

    // Ensure bcrypt passwords for demo accounts match exactly
    console.log('🔄 Synchronizing demo account password hashes with bcrypt...');
    const adminHash = await bcrypt.hash('Admin123!', 10);
    const studentHash = await bcrypt.hash('Student123!', 10);

    await connection.query('UPDATE users SET password = ? WHERE role = ?', [adminHash, 'admin']);
    await connection.query('UPDATE users SET password = ? WHERE role = ?', [studentHash, 'student']);
    console.log('✅ Passwords synchronized.');

    console.log('\n🎉 Database setup complete!');
    console.log('--------------------------------------------------');
    console.log('Admin Account:');
    console.log('  Email:    admin@campusmarket.edu');
    console.log('  Password: Admin123!');
    console.log('\nStudent Demo Accounts:');
    console.log('  Email:    aarav.sharma@campusmarket.edu');
    console.log('  Email:    priya.patel@campusmarket.edu');
    console.log('  Email:    rohan.verma@campusmarket.edu');
    console.log('  Password: Student123!');
    console.log('--------------------------------------------------\n');

  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\n⚠️  Could not connect to MySQL at ' + dbConfig.host + ':' + dbConfig.port);
      console.error('Please ensure the MySQL service is started (e.g. through Windows Services or MySQL Workbench),');
      console.error('and verify DB_PASSWORD in server/.env if your root user requires a password.\n');
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initializeDatabase();
