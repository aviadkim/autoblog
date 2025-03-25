const fs = require('fs/promises');
const path = require('path');
const { log, LogLevel } = require('./utils/logger');

const DEFAULT_CONFIG = {
  googleTrends: {
    language: 'en',
    region: 'US'
  },
  keywordPreferences: {
    relevantTerms: ['ai', 'technology', 'digital', 'automation', 'machine learning', 'data', 'cloud'],
    minScore: 10,
    maxTopicsToAnalyze: 10
  },
  gemini: {
    apiKey: process.env.GOOGLE_API_KEY || '',
    model: 'gemini-pro'
  },
  googleSearch: {
    apiKey: process.env.GOOGLE_API_KEY || '',
    searchEngineId: process.env.GOOGLE_SEARCH_ENGINE_ID || ''
  },
  content: {
    minWordCount: 1000,
    maxWordCount: 1500,
    language: 'en'
  },
  blog: {
    name: 'AutoBloga Tech Blog',
    description: 'Automated insights on technology trends',
    baseUrl: 'https://example.com',
    language: 'en'
  },
  publishing: {
    enabled: false,
    wordpress: {
      url: process.env.WORDPRESS_URL || '',
      username: process.env.WORDPRESS_USERNAME || '',
      password: process.env.WORDPRESS_PASSWORD || '',
      categories: [1],
      tags: []
    }
  },
  system: {
    dataDir: path.join(process.cwd(), 'data'),
    logsDir: path.join(process.cwd(), 'data', 'logs'),
    postsDir: path.join(process.cwd(), 'data', 'posts'),
    trendsDir: path.join(process.cwd(), 'data', 'trends'),
    githubPagesDir: path.join(process.cwd(), 'docs', 'posts'),
    maxRetries: 3,
    retryDelay: 1000
  }
};

async function setupConfig() {
  try {
    log(LogLevel.DEBUG, 'Setting up configuration');
    const config = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
    const configPath = path.join(process.cwd(), 'config.json');
    let customConfig = {};
    
    try {
      const configData = await fs.readFile(configPath, 'utf-8');
      customConfig = JSON.parse(configData);
      log(LogLevel.INFO, 'Loaded custom configuration from config.json');
    } catch (error) {
      if (error.code !== 'ENOENT') {
        log(LogLevel.WARN, `Error reading config file: ${error.message}`, error);
      } else {
        log(LogLevel.INFO, 'No custom config.json found, using defaults');
      }
    }
    
    mergeConfigs(config, customConfig);
    validateConfig(config);
    return config;
  } catch (error) {
    log(LogLevel.ERROR, `Error setting up configuration: ${error.message}`, error);
    throw new Error(`Configuration setup failed: ${error.message}`);
  }
}

function mergeConfigs(target, source) {
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key]) target[key] = {};
      mergeConfigs(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
}

function validateConfig(config) {
  if (!config.gemini.apiKey) {
    log(LogLevel.WARN, 'No Google API key provided - some features may not work');
  }
  
  if (!config.googleSearch.searchEngineId && config.googleSearch.apiKey) {
    log(LogLevel.WARN, 'No Google Search Engine ID provided - search features may not work');
  }
  
  if (config.publishing.enabled) {
    if (!config.publishing.wordpress.url) {
      throw new Error('WordPress URL is required when publishing is enabled');
    }
    if (!config.publishing.wordpress.username || !config.publishing.wordpress.password) {
      throw new Error('WordPress credentials are required when publishing is enabled');
    }
  }
}

module.exports = { setupConfig };
