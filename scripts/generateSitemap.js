require('dotenv').config();
const SitemapGenerator = require('../utils/sitemapGenerator');
const { connectDB, sequelize } = require('../config/database');

async function generateSitemap() {
  try {
    // Connect to database
    await connectDB();
    console.log('📊 Connected to database');

    // Initialize generator
    const generator = new SitemapGenerator(
      process.env.FRONTEND_URL || 'https://www.trasealla.com'
    );

    // Generate sitemap
    const success = await generator.generate();

    if (success) {
      console.log('✅ Sitemap generation completed');
      
      // Generate sitemap index for large sites
      await generator.generateIndex();
      console.log('✅ Sitemap index generated');
    } else {
      console.error('❌ Sitemap generation failed');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run if called directly
if (require.main === module) {
  generateSitemap();
}

module.exports = generateSitemap;
