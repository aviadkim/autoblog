const fs = require('fs/promises');
const path = require('path');

const LogLevel = {
  DEBUG: 'DEBUG',
  INFO: 'INFO', 
  WARN: 'WARN',
  ERROR: 'ERROR'
};

async function log(level, message, error = null) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] [${level}] ${message}${error ? `\nError: ${error.message}\n${error.stack}` : ''}`;
  
  switch (level) {
    case LogLevel.DEBUG:
      console.debug(logEntry);
      break;
    case LogLevel.INFO:
      console.info(logEntry);
      break;
    case LogLevel.WARN:
      console.warn(logEntry);
      break;
    case LogLevel.ERROR:
      console.error(logEntry);
      break;
    default:
      console.log(logEntry);
  }
  
  try {
    const logsDir = path.join(process.cwd(), 'data', 'logs');
    await fs.mkdir(logsDir, { recursive: true });
    
    const logFile = path.join(logsDir, `${new Date().toISOString().split('T')[0]}.log`);
    await fs.appendFile(logFile, logEntry + '\n');
  } catch (fileError) {
    console.error(`Failed to write to log file: ${fileError.message}`);
  }
}

module.exports = { log, LogLevel };
