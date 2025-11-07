import pg from 'pg';
import 'dotenv/config';
import log from '../utils/logger.js';

const { Pool } = pg;

// Configuración de la conexión a PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Probar la conexión al inicializar
pool.on('connect', () => {
  log.ok('PostgreSQL connected successfully');
});

pool.on('error', (err) => {
  log.error('Unexpected error on PostgreSQL connection: ' + err.message);
  process.exit(-1);
});

// Función para inicializar las tablas de imágenes si no existen
const initializeDatabase = async () => {
  try {
    const client = await pool.connect();
    
    // Crear tabla images_metadata si no existe
    const createImagesTableQuery = `
      CREATE TABLE IF NOT EXISTS images_metadata (
        name VARCHAR(100) PRIMARY KEY,
        mask_name VARCHAR(255) NOT NULL,
        path VARCHAR(100) NOT NULL,
        mime VARCHAR(100) NOT NULL,
        size INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await client.query(createImagesTableQuery);
    log.ok('Table "images_metadata" verified/created successfully');

    // Crear tabla cleanup_queue si no existe
    const createCleanupQueueTableQuery = `
      CREATE TABLE IF NOT EXISTS cleanup_queue (
        name VARCHAR(100) PRIMARY KEY,
        fail_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        delete_state BOOLEAN DEFAULT FALSE
      );
    `;

    await client.query(createCleanupQueueTableQuery);
    log.ok('Table "cleanup_queue" verified/created successfully');

    client.release();
  } catch (err) {
    log.error('Error initializing database: ' + err.message);
    throw err;
  }
};

// Función para probar la conexión (requerida por server.js)
const testConnection = async () => {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    return true;
  } catch (error) {
    throw new Error(`Database connection failed: ${error.message}`);
  }
};

// Función para cerrar las conexiones (requerida por server.js)
const closeConnections = async () => {
  try {
    await pool.end();
    log.ok('Database connections closed successfully');
  } catch (error) {
    log.error('Error closing connections: ' + error.message);
    throw error;
  }
};

export default { 
  pool, 
  initializeDatabase, 
  testConnection, 
  closeConnections 
};