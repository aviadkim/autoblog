const fs = require('fs/promises');
const path = require('path');
const { log, LogLevel } = require('./logger');

async function saveToStorage(data, directory, id) {
  try {
    await fs.mkdir(directory, { recursive: true });
    const filePath = path.join(directory, `${id}.json`);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    log(LogLevel.DEBUG, `Data saved to ${filePath}`);
    return filePath;
  } catch (error) {
    log(LogLevel.ERROR, `Error saving data to storage: ${error.message}`, error);
    throw new Error(`Failed to save data: ${error.message}`);
  }
}

async function loadFromStorage(directory, id) {
  try {
    const filePath = path.join(directory, `${id}.json`);
    
    try {
      await fs.access(filePath);
    } catch (error) {
      return null;
    }
    
    const data = await fs.readFile(filePath, 'utf-8');
    log(LogLevel.DEBUG, `Data loaded from ${filePath}`);
    return JSON.parse(data);
  } catch (error) {
    log(LogLevel.ERROR, `Error loading data from storage: ${error.message}`, error);
    return null;
  }
}

module.exports = { saveToStorage, loadFromStorage };
