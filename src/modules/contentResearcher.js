const axios = require('axios');
const { log, LogLevel } = require('../utils/logger');

async function performResearch(keyword, config) {
  try {
    log(LogLevel.DEBUG, `Researching keyword: ${keyword.title}`);
    
    if (!config.apiKey || !config.searchEngineId) {
      log(LogLevel.WARN, 'Missing Google Search API key or Search Engine ID, falling back to basic research');
      return createBasicResearch(keyword);
    }
    
    const query = encodeURIComponent(keyword.title);
    const url = `https://www.googleapis.com/customsearch/v1?key=${config.apiKey}&cx=${config.searchEngineId}&q=${query}&num=10`;
    
    const response = await axios.get(url);
    
    if (!response.data.items || response.data.items.length === 0) {
      log(LogLevel.WARN, 'No search results found, falling back to basic research');
      return createBasicResearch(keyword);
    }
    
    const sources = response.data.items.map(item => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet,
      source: item.displayLink
    }));
    
    const content = compileResearch(sources, keyword.title);
    
    log(LogLevel.DEBUG, `Research completed with ${sources.length} sources`);
    return {
      keyword: keyword.title,
      sources,
      content,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    log(LogLevel.ERROR, `Error researching keyword: ${error.message}`, error);
    log(LogLevel.WARN, 'Falling back to basic research');
    return createBasicResearch(keyword);
  }
}

function compileResearch(sources, keyword) {
  let compiledResearch = `# Research on ${keyword}\n\n`;
  
  compiledResearch += `## Overview\n\n`;
  compiledResearch += `This research compilation provides information about "${keyword}" from various sources.\n\n`;
  
  compiledResearch += `## Key Insights\n\n`;
  sources.slice(0, 3).forEach((source, index) => {
    compiledResearch += `### Insight ${index + 1}: ${source.title}\n`;
    compiledResearch += `${source.snippet}\n\n`;
    compiledResearch += `Source: [${source.source}](${source.link})\n\n`;
  });
  
  compiledResearch += `## Detailed Information\n\n`;
  sources.slice(3).forEach((source, index) => {
    compiledResearch += `### Source ${index + 1}: ${source.title}\n`;
    compiledResearch += `${source.snippet}\n\n`;
    compiledResearch += `Source: [${source.source}](${source.link})\n\n`;
  });
  
  if (sources.length > 0) {
    compiledResearch += `## Related Topics\n\n`;
    compiledResearch += `- ${keyword} trends\n`;
    compiledResearch += `- ${keyword} examples\n`;
    compiledResearch += `- ${keyword} best practices\n`;
    compiledResearch += `- ${keyword} future\n`;
    compiledResearch += `- ${keyword} applications\n\n`;
  }
  
  return compiledResearch;
}

function createBasicResearch(keyword) {
  log(LogLevel.DEBUG, 'Creating basic research template');
  
  const content = `# Basic Research on ${keyword.title}\n\n` +
    `## Overview\n\n` +
    `This is a template for researching "${keyword.title}". Since detailed search results weren't available, ` +
    `this provides a structure for the content generation.\n\n` +
    `## Suggested Sections\n\n` +
    `- Introduction to ${keyword.title}\n` +
    `- Current trends related to ${keyword.title}\n` +
    `- Key aspects of ${keyword.title}\n` +
    `- Applications or use cases\n` +
    `- Future outlook\n` +
    `- Related topics\n\n` +
    `## Context\n\n` +
    `The content should be informative, engaging, and valuable to readers interested in ${keyword.title}.\n`;
  
  return {
    keyword: keyword.title,
    sources: [],
    content,
    timestamp: new Date().toISOString()
  };
}

module.exports = { performResearch };
