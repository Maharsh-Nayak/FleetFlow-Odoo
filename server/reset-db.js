// FleetFlow Database Reset Utility
// This script drops all tables so Sequelize can recreate them correctly

require('dotenv').config();
const mysql = require('mysql2/promise');

async function resetDatabase() {
  console.log('\n============================================');
  console.log('FleetFlow Database Reset Utility');
  console.log('============================================\n');
  
  console.log('⚠️  WARNING: This will DELETE ALL DATA!\n');
  
  try {
    // Create connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'fleetflow'
    });
    
    console.log('✓ Connected to MySQL\n');
    console.log('Dropping tables...\n');
    
    // Drop tables in correct order (respecting foreign keys)
    const tables = [
      'expenses',
      'fuel_logs',
      'maintenance_logs',
      'trips',
      'drivers',
      'vehicles',
      'users'
    ];
    
    for (const table of tables) {
      try {
        await connection.execute(`DROP TABLE IF EXISTS ${table}`);
        console.log(`  ✓ Dropped table: ${table}`);
      } catch (err) {
        console.log(`  ⚠️  Table ${table} doesn't exist or error: ${err.message}`);
      }
    }
    
    await connection.end();
    
    console.log('\n✓ Database reset complete!\n');
    console.log('Next steps:');
    console.log('  1. npm run dev');
    console.log('  2. Sequelize will auto-create all tables\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n✗ Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('  - Check your .env file exists');
    console.error('  - Verify DB_PASSWORD is correct');
    console.error('  - Make sure MySQL is running\n');
    process.exit(1);
  }
}

// Run it
resetDatabase();
