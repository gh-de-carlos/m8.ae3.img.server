/**
 * Middleware Controller
 * Centralized middleware functions for request handling, logging, and error management
 */

import log from '../utils/logger.js';

// Security headers middleware
export const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
};

// Request logging middleware
export const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  const userAgent = req.get('User-Agent') || 'Unknown';
  
  log.http(`${timestamp} ${method} ${url} - ${userAgent}`);
  next();
};

// 404 Not Found handler
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `Route ${req.method} ${req.originalUrl} does not exist`,
    availableEndpoints: ['/images', '/health', '/api']
  });
};

// Centralized error handler (must be last middleware)
export const errorHandler = (err, req, res, next) => {
  log.error('Request error: ' + err.message);
  console.error('       Stack:', err.stack);
  console.error('       URL:', req.originalUrl);
  console.error('       Method:', req.method);
  console.error('       Timestamp:', new Date().toISOString());

  // Default error response
  let statusCode = err.statusCode || err.status || 500;
  let message = 'Internal server error';

  // Handle specific error types
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413;
    message = 'File too large. Maximum size is 5MB.';
  } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400;
    message = 'Unexpected field name or too many files.';
  } else if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Invalid JSON format.';
  } else if (statusCode < 500) {
    // Client errors - safe to expose message
    message = err.message;
  }

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: err 
    })
  });
};