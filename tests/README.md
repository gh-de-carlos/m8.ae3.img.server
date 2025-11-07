# Tests Directory

This directory contains test scripts for the M8.AE3 File Upload project.

## Available Tests

### `database.test.js`
Tests database connectivity and initialization.

**Purpose:**
- Verify PostgreSQL connection
- Initialize database tables (images_metadata, cleanup_queue)  
- Validate table creation and structure
- Test basic query execution

**Usage:**
```bash
# Run database tests
npm test
npm run test:db
npm run db:init

# Or run directly
node tests/database.test.js
```

**Requirements:**
- PostgreSQL server running
- Valid `.env` file with database credentials
- Database `m8_img_server` exists

## Adding New Tests

When adding new test files:

1. Use descriptive filenames: `*.test.js`
2. Follow the ASCII logging pattern: `[INFO]`, `[TEST]`, `[PASS]`, `[FAIL]`, `[WARN]`
3. Include proper cleanup in `finally` blocks
4. Add npm script entries in `package.json`
5. Document the test purpose and usage in this README

## CI/CD Integration

These tests are designed to be:
- **Standalone** - No server startup required
- **Fast** - Quick connection and validation only
- **Reliable** - Proper error handling and cleanup
- **Informative** - Clear logging for debugging

Perfect for automated testing pipelines and development workflows.