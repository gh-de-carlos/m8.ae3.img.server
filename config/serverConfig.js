import db from './database.js';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import log from '../utils/logger.js';

// ES Modules __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Función para inicializar base de datos y arrancar servidor
export const startServer = async (app, PORT) => {
  const NODE_ENV = process.env.NODE_ENV || 'development';
  
  try {
    // Fancy branding
    log.info('Powered by COOL - Completely Organized Outstanding Logger 😁\n');

    // Verify database connection
    log.info('Testing database connection...');
    await db.testConnection();
    log.pass('Database connection successful');

    // Initialize database tables
    log.info('Initializing database tables...');
    await db.initializeDatabase();
    log.pass('Database tables ready');

    // Verify upload directory exists
    log.info('Checking upload directory...');
    await fs.mkdir(path.join(__dirname, '..', 'uploads'), { recursive: true });
    log.pass('Upload directory ready');

    // Start HTTP server
    const server = app.listen(PORT, () => {
      log.info(`Server running on port ${PORT}`);
      log.info(`Environment: ${NODE_ENV}`);
      log.info(`Health check: http://localhost:${PORT}/health`);
      log.info(`API docs: http://localhost:${PORT}/api`);
      
      if (NODE_ENV === 'development') {
        log.info('Development mode - watching for changes');
      }
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        log.error(`Port ${PORT} is already in use`);
        process.exit(1);
      } else {
        log.error('Server error: ' + error.message);
        process.exit(1);
      }
    });

    return server;
  } catch (error) {
    log.error('Failed to start server: ' + error.message);
    process.exit(1);
  }
};

// Graceful server shutdown configuration
export const setupServerShutdown = (server = null) => {
  const shutdown = async (signal) => {
    log.stop(`Received ${signal}, starting graceful shutdown...`);

    // Close HTTP server
    if (server) {
      server.close(async () => {
        log.info('HTTP server closed');

        try {
          // Close database connections
          await db.closeConnections();
          log.info('Database connections closed');
          log.pass('Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          log.error('Error during shutdown: ' + error.message);
          process.exit(1);
        }
      });

      // Force shutdown if graceful shutdown takes too long
      setTimeout(() => {
        log.error('Shutdown timeout, forcing exit');
        process.exit(1);
      }, 10000);
    } else {
      process.exit(0);
    }
  };

  // Graceful shutdown signals
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    log.error('Uncaught Exception: ' + error.message);
    shutdown('UNCAUGHT_EXCEPTION');
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    log.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
    shutdown('UNHANDLED_REJECTION');
  });
};