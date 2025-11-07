/**
 * COOL - Completely Organized Outstanding Logger
 * Provides ANSI color codes for log level formatting
 */

// ANSI color codes
const colors = {
  reset: '\x1b[0m',         // Default color
  cyan: '\x1b[36m',         // INFO
  red: '\x1b[31m',          // ERROR
  green: '\x1b[32m',        // PASS
  lightBlue: '\x1b[94m',    // Light blue for [OK]
  yellow: '\x1b[33m',       // WARN
  blue: '\x1b[34m',         // DEBUG
  white: '\x1b[37m'         // Default white
};

// Colored log level formatters
export const logLevels = {
  INFO: (message) => `${colors.cyan}[INFO]${colors.reset}  ${message}`,
  ERROR: (message) => `${colors.red}[ERROR]${colors.reset} ${message}`,
  PASS: (message) => `${colors.green}[PASS]${colors.reset}  ${message}`,
  OK: (message) => `${colors.lightBlue}[OK]${colors.reset}    ${message}`,
  
  // Additional levels for future use
  WARN: (message) => `${colors.yellow}[WARN]${colors.reset} ${message}`,
  DEBUG: (message) => `${colors.blue}[DEBUG]${colors.reset} ${message}`,
  STOP: (message) => `\n${colors.red}[STOP]${colors.reset}  ${message}`,
  TEST: (message) => `${colors.blue}[TEST]${colors.reset}  ${message}`,
  HELP: (message) => `${colors.yellow}[HELP]${colors.reset} ${message}`,
  FAIL: (message) => `${colors.red}[FAIL]${colors.reset} ${message}`,
  HTTP: (message) => `${colors.blue}[HTTP]${colors.reset} ${message}`
};

// Convenience logging functions
export const log = {
  info: (message) => console.log(logLevels.INFO(message)),
  error: (message) => console.error(logLevels.ERROR(message)),
  pass: (message) => console.log(logLevels.PASS(message)),
  ok: (message) => console.log(logLevels.OK(message)),
  warn: (message) => console.log(logLevels.WARN(message)),
  debug: (message) => console.log(logLevels.DEBUG(message)),
  stop: (message) => console.log(logLevels.STOP(message)),
  test: (message) => console.log(logLevels.TEST(message)),
  help: (message) => console.log(logLevels.HELP(message)),
  fail: (message) => console.error(logLevels.FAIL(message)),
  http: (message) => console.log(logLevels.HTTP(message))
};

export default log;