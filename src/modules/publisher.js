const axios = require('axios');
const { log, LogLevel } = require('../utils/logger');

async function publishContent(postData, config) {
  try {
    log(LogLevel.DEBUG, 'Publishing content to WordPress');
    
    if (!config.enabled || !config.wordpress.url) {
      log(LogLevel.INFO, 'Publishing is disabled or not configured');
      return { success: false, message: 'Publishing is disabled or not configured' };
    }
    
    const wordpressPostData = {
      title: postData.title,
      content: postData.html,
      status: 'publish',
      categories: config.wordpress.categories || [1],
      tags: config.wordpress.tags || []
    };
    
    if (postData.seo && postData.seo.metaDescription) {
      wordpressPostData.excerpt = postData.seo.metaDescription;
    }
    
    const url = config.wordpress.url;
    const auth = {
      username: config.wordpress.username,
      password: config.wordpress.password
    };
    
    const response = await axios.post(url, wordpressPostData, { auth });
    
    if (response.data && response.data.id) {
      log(LogLevel.INFO, `Content published to WordPress with ID: ${response.data.id}`);
      return {
        success: true,
        id: response.data.id,
        url: response.data.link,
        message: 'Content published successfully'
      };
    } else {
      throw new Error('Invalid response from WordPress API');
    }
    
  } catch (error) {
    log(LogLevel.ERROR, `Error publishing content: ${error.message}`, error);
    throw new Error(`Failed to publish content: ${error.message}`);
  }
}

module.exports = { publishContent };
