# AutoBloga - Automated Blog Content Generator

AutoBloga is an automated system that generates high-quality blog content using AI and trending topics. It leverages Google's free APIs to research, write, and optionally publish blog posts with minimal human intervention.

## Features

- 🔍 Discovers trending topics using Google Trends
- 🎯 Selects topics relevant to your blog's focus
- 📝 Generates comprehensive blog posts using Google Gemini API
- 🔍 Optimizes content for SEO
- 🌐 Publishes content to WordPress (optional)
- 📊 Provides a dashboard to view and manage generated content

## Setup

1. Clone this repository
2. Create a Google Cloud project and enable required APIs
3. Add your API keys as GitHub secrets
4. Configure your blog preferences in `config.json`
5. Enable GitHub Pages for the dashboard

See the [Setup Guide](docs/SETUP.md) for detailed instructions.

## Usage

The system runs automatically once a day via GitHub Actions, or you can trigger it manually from the Actions tab.

Generated content is accessible via:
- GitHub Pages dashboard (view, copy, download)
- Data directory in the repository
- WordPress if publishing is enabled

## Configuration

Edit `config.json` to customize:
- Keyword preferences and relevance criteria
- Blog details and branding
- Publishing options
- API configurations

## License

MIT