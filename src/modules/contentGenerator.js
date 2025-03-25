const axios = require('axios');
const { log, LogLevel } = require('../utils/logger');

async function generateContent(keyword, research, config) {
  try {
    log(LogLevel.DEBUG, `Generating content for keyword: ${keyword.title}`);
    
    const prompt = `Create a comprehensive, engaging blog post about "${keyword.title}".

Use the following research as your foundation:
${research.content}

Write a blog post that includes:
1. An attention-grabbing headline that includes the main keyword
2. An engaging introduction explaining why this topic matters now
3. 4-6 well-structured sections with descriptive subheadings
4. Practical examples, applications, or case studies
5. A conclusion with key takeaways
6. SEO optimization for the keyword

Format the article with HTML tags (h1, h2, h3, p, ul, li, etc.) for web publishing.
The blog should be 1200-1500 words in length, professional but conversational in tone, and aimed at tech-savvy readers.

Also include:
- A suggested meta description (150-160 characters)
- 5-7 relevant related keywords for SEO purposes`;

    const url = 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent';
    
    const response = await axios.post(url, {
      contents: [{ 
        role: "user", 
        parts: [{ text: prompt }] 
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': config.apiKey
      }
    });
    
    let content = '';
    if (response.data?.candidates?.[0]?.content?.parts?.[0]) {
      content = response.data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Unexpected API response format');
    }
    
    log(LogLevel.DEBUG, 'Content generation completed');
    return {
      content,
      keyword: keyword.title,
      wordCount: countWords(content),
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    log(LogLevel.ERROR, `Error generating content: ${error.message}`, error);
    throw new Error(`Failed to generate content: ${error.message}`);
  }
}

function countWords(text) {
  const cleanText = text.replace(/<[^>]*>/g, ' ');
  const words = cleanText.split(/\s+/).filter(word => word.length > 0);
  return words.length;
}

module.exports = { generateContent };
