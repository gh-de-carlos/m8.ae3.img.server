#!/usr/bin/env node

/**
 * Database Connection Test Script
 * 
 * Tests database connectivity and initialization without starting the full server.
 * Usage: node tests/database.test.js
 */

import db from '../config/database.js';
import log from '../utils/logger.js';

const testDatabase = async () => {
  log.info('Testing database connection...\n');

  try {
    // Test basic connection
    log.test('1. Testing basic connectivity...');
    await db.testConnection();
    log.pass('Database connection successful\n');

    // Test table initialization
    log.test('2. Initializing database tables...');
    await db.initializeDatabase();
    log.pass('Database tables initialized\n');

    // Test a simple query
    log.test('3. Testing query execution...');
    const result = await db.pool.query('SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = $1', ['public']);
    log.pass(`Query successful - Found ${result.rows[0].table_count} tables\n`);

    // List created tables
    log.test('4. Verifying created tables...');
    const tables = await db.pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('images_metadata', 'cleanup_queue')
      ORDER BY table_name
    `);
    
    if (tables.rows.length > 0) {
      log.pass('Found expected tables:');
      tables.rows.forEach(row => {
        console.log(`        - ${row.table_name}`);
      });
    } else {
      log.warn('No expected tables found');
    }

    console.log('');
    log.pass('All database tests passed!');
    
  } catch (error) {
    log.fail('Database test failed:');
    console.error(`       Error: ${error.message}`);
    
    if (error.code) {
      console.error(`       Code: ${error.code}`);
    }
    
    console.error('');
    log.help('Troubleshooting tips:');
    console.error('       - Check your .env file exists and has correct database credentials');
    console.error('       - Ensure PostgreSQL is running');
    console.error('       - Verify database exists: CREATE DATABASE m8_img_server;');
    console.error('       - Check network connectivity to database host');
    
    process.exit(1);
  } finally {
    // Always close connections
    try {
      await db.closeConnections();
      console.log('');
      log.info('Database connections closed cleanly');
    } catch (closeError) {
      log.warn('Error closing database connections: ' + closeError.message);
    }
  }
};

// Run the test
testDatabase();