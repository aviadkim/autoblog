const { log, LogLevel } = require('../utils/logger');

/**
 * Selects the best keyword from trending topics
 * 
 * @param {Array} trendingTopics - Array of trending topics
 * @param {Object} preferences - Keyword preferences
 * @returns {Promise<Object>} - Selected keyword
 */
async function selectBestKeyword(trendingTopics, preferences) {
  try {
    log(LogLevel.DEBUG, 'Selecting best keyword from trending topics');
    
    if (!trendingTopics || trendingTopics.length === 0) {
      throw new Error('No trending topics to select from');
    }
    
    // Score each topic based on relevance to blog
    const scoredTopics = trendingTopics.map(topic => {
      let score = 0;
      const title = topic.title.toLowerCase();
      
      // Score based on relevant terms
      preferences.relevantTerms.forEach(term => {
        if (title.includes(term.toLowerCase())) {
          score += 10;
        }
      });
      
      // Score based on traffic
      score += Math.log10(topic.trafficEstimate || 1000) * 2;
      
      // Score based on articles (research material)
      score += (topic.articles?.length || 0) * 2;
      
      return {
        ...topic,
        score
      };
    });
    
    // Sort by score and filter by minimum score
    const filteredTopics = scoredTopics
      .filter(topic => topic.score >= (preferences.minScore || 0))
      .sort((a, b) => b.score - a.score);
    
    // If no topics meet the minimum score, take the highest scoring one
    const selectedTopic = filteredTopics.length > 0 ? 
      filteredTopics[0] : 
      scoredTopics.sort((a, b) => b.score - a.score)[0];
    
    log(LogLevel.DEBUG, `Selected keyword "${selectedTopic.title}" with score ${selectedTopic.score}`);
    return selectedTopic;
    
  } catch (error) {
    log(LogLevel.ERROR, `Error selecting best keyword: ${error.message}`, error);
    throw new Error(`Failed to select keyword: ${error.message}`);
  }
}

module.exports = { selectBestKeyword };
