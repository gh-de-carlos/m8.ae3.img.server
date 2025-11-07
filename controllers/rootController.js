/**
 * Root Controller
 * Handles root endpoints and API documentation
 */

// Health check endpoint
export const healthCheck = (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
};

// API documentation endpoint
export const getApiDocumentation = (req, res) => {
  res.json({
    name: 'M8.AE3 File Upload API',
    version: '1.0.0',
    description: 'Enterprise file upload service with transactional operations',
    endpoints: {
      'POST /images': 'Upload and validate files with MIME type verification',
      'DELETE /images/:filename': 'Delete files with transactional rollback',
      'GET /health': 'Service health check',
      'GET /api': 'This documentation'
    },
    features: [
      'MIME type validation against file signatures',
      'Database-backed metadata management', 
      'Transactional file operations',
      'Cleanup queue for consistency',
      'Memory validation before disk writes'
    ],
    security: [
      'File signature verification',
      'Extension and MIME type cross-validation',
      'Size limits (5MB maximum)',
      'Memory-first validation approach'
    ],
    usage: {
      'File Upload': 'POST /images with multipart/form-data, field name: "image"',
      'File Delete': 'DELETE /images/{filename} where filename is the server-generated name',
      'Supported Types': ['.jpg', '.png', '.gif', '.pdf', '.txt'],
      'Max Size': '5MB per file'
    }
  });
};