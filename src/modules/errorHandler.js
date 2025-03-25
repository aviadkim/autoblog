const { log, LogLevel } = require('../utils/logger');

async function handleErrors(fn, errorMessage, maxRetries = 3, retryDelay = 1000) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      log(LogLevel.WARN, `${errorMessage}: Attempt ${attempt}/${maxRetries + 1} failed - ${error.message}`, error);
      
      if (attempt > maxRetries) {
        throw new Error(`${errorMessage} after ${maxRetries} retries: ${error.message}`);
      }
      
      log(LogLevel.DEBUG, `Retrying in ${retryDelay}ms...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
}

module.exports = { handleErrors };
