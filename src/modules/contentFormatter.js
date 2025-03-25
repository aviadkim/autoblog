const { log, LogLevel } = require('../utils/logger');
const marked = require('marked');

async function formatContent(content, seoData) {
  try {
    log(LogLevel.DEBUG, 'Formatting content for publishing');
    
    let rawContent = content.content;
    let html = rawContent;
    
    if (!html.includes('<h1>') && !html.includes('<p>')) {
      html = convertMarkdownToHtml(rawContent);
    }
    
    if (seoData) {
      html = addSeoMetaTags(html, seoData);
    }
    
    const markdown = convertHtmlToMarkdown(html);
    
    log(LogLevel.DEBUG, 'Content formatting completed');
    return {
      content: rawContent,
      html,
      markdown,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    log(LogLevel.ERROR, `Error formatting content: ${error.message}`, error);
    throw new Error(`Failed to format content: ${error.message}`);
  }
}

function convertMarkdownToHtml(markdown) {
  try {
    let html = markdown
      .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
      .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
      .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^\- (.*?)$/gm, '<li>$1</li>')
      .replace(/(<li>.*?<\/li>\n)+/g, '<ul>$&</ul>')
      .replace(/^([^<\n].*?)$/gm, '<p>$1</p>');
    
    return html;
  } catch (error) {
    log(LogLevel.ERROR, `Error converting markdown to HTML: ${error.message}`, error);
    return markdown;
  }
}

function convertHtmlToMarkdown(html) {
  try {
    let markdown = html
      .replace(/<h1>(.*?)<\/h1>/g, '# $1\n\n')
      .replace(/<h2>(.*?)<\/h2>/g, '## $1\n\n')
      .replace(/<h3>(.*?)<\/h3>/g, '### $1\n\n')
      .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
      .replace(/<em>(.*?)<\/em>/g, '*$1*')
      .replace(/<li>(.*?)<\/li>/g, '- $1\n')
      .replace(/<\/?ul>/g, '')
      .replace(/<p>(.*?)<\/p>/g, '$1\n\n')
      .replace(/\n{3,}/g, '\n\n');
    
    return markdown;
  } catch (error) {
    log(LogLevel.ERROR, `Error converting HTML to markdown: ${error.message}`, error);
    return html;
  }
}

function addSeoMetaTags(html, seoData) {
  try {
    let metaHtml = '<!-- SEO Information\n';
    
    if (seoData.seoTitle) {
      metaHtml += `Title: ${seoData.seoTitle}\n`;
    }
    
    if (seoData.metaDescription) {
      metaHtml += `Description: ${seoData.metaDescription}\n`;
    }
    
    if (seoData.relatedKeywords && seoData.relatedKeywords.length > 0) {
      metaHtml += `Keywords: ${seoData.relatedKeywords.join(', ')}\n`;
    }
    
    metaHtml += '-->\n\n';
    
    return metaHtml + html;
  } catch (error) {
    log(LogLevel.ERROR, `Error adding SEO meta tags: ${error.message}`, error);
    return html;
  }
}

module.exports = { formatContent };
