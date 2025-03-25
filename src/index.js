// AutoBloga - Automated Blog Content Generator
// Main application entry point

const fs = require('fs/promises');
const path = require('path');
const { getTrendingTopics } = require('./modules/trendAnalyzer');
const { selectBestKeyword } = require('./modules/keywordSelector');
const { performResearch } = require('./modules/contentResearcher');
const { generateContent } = require('./modules/contentGenerator');
const { optimizeSeo } = require('./modules/seoOptimizer');
const { formatContent } = require('./modules/contentFormatter');
const { publishContent } = require('./modules/publisher');
const { handleErrors } = require('./modules/errorHandler');
const { setupConfig } = require('./config');
const { log, LogLevel } = require('./utils/logger');
const { saveToStorage } = require('./utils/storage');

// Data storage paths
const DATA_DIR = path.join(process.cwd(), 'data');
const POSTS_DIR = path.join(DATA_DIR, 'posts');
const GITHUB_PAGES_POSTS = path.join(process.cwd(), 'docs', 'posts');

async function ensureDirectories() {
  const dirs = [DATA_DIR, POSTS_DIR, path.join(DATA_DIR, 'logs'), 
                path.join(DATA_DIR, 'trends'), GITHUB_PAGES_POSTS];
  for (const dir of dirs) {
    await fs.mkdir(dir, { recursive: true });
  }
}

async function runAutoBlogWorkflow() {
  try {
    await ensureDirectories();
    log(LogLevel.INFO, 'AutoBloga workflow started');
    
    const config = await setupConfig();
    log(LogLevel.INFO, 'Configuration loaded');
    
    // Step 1: Get trending topics
    const trendingTopics = await handleErrors(
      () => getTrendingTopics(config.googleTrends),
      'Error fetching trending topics',
      3
    );
    
    // Step 2: Select keyword and generate content
    const selectedKeyword = await selectBestKeyword(trendingTopics, config.keywordPreferences);
    const research = await handleErrors(
      () => performResearch(selectedKeyword, config.googleSearch),
      'Error performing research',
      3
    );
    const content = await handleErrors(
      () => generateContent(selectedKeyword, research, config.gemini),
      'Error generating content',
      3
    );
    
    // Step 3: Optimize and format
    const seoData = await optimizeSeo(content, selectedKeyword, config.gemini);
    const formattedContent = await formatContent(content, seoData);
    
    // Step 4: Save and publish
    const timestamp = new Date().toISOString();
    const postId = `post-${timestamp.split('T')[0]}-${selectedKeyword.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`;
    
    const postData = {
      id: postId,
      title: seoData.seoTitle || `Blog about ${selectedKeyword.title}`,
      keyword: selectedKeyword.title,
      content: formattedContent.content,
      html: formattedContent.html,
      markdown: formattedContent.markdown,
      createdAt: timestamp,
      trendData: selectedKeyword,
      published: false
    };
    
    await saveToStorage(postData, POSTS_DIR, postId);
    await updateGitHubPagesData(postData);
    
    if (config.publishing.enabled) {
      const publishResult = await handleErrors(
        () => publishContent(postData, config.publishing),
        'Error publishing content',
        3
      );
      postData.published = true;
      postData.publishedUrl = publishResult.url;
      await saveToStorage(postData, POSTS_DIR, postId);
    }
    
    return { success: true, postId };
  } catch (error) {
    log(LogLevel.ERROR, `Workflow failed: ${error.message}`, error);
    return { success: false, error: error.message };
  }
}

async function updateGitHubPagesData(postData) {
  const postPath = path.join(GITHUB_PAGES_POSTS, `${postData.id}.json`);
  await fs.writeFile(postPath, JSON.stringify(postData, null, 2));
  
  const archivesPath = path.join(GITHUB_PAGES_POSTS, 'archives.json');
  let archives = [];
  try {
    const archivesData = await fs.readFile(archivesPath, 'utf-8');
    archives = JSON.parse(archivesData);
  } catch (error) {
    // Create new if doesn't exist
  }
  
  archives.unshift({
    id: postData.id,
    title: postData.title,
    keyword: postData.keyword,
    createdAt: postData.createdAt,
    published: postData.published,
    publishedUrl: postData.publishedUrl
  });
  
  archives = archives.slice(0, 100);
  await fs.writeFile(archivesPath, JSON.stringify(archives, null, 2));
}

module.exports = { runAutoBlogWorkflow };

if (require.main === module) {
  runAutoBlogWorkflow()
    .then(result => {
      console.log('Workflow result:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch(err => {
      console.error('Unhandled error:', err);
      process.exit(1);
    });
}
