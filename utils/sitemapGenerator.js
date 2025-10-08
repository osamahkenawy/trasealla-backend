const { SitemapStream, streamToPromise } = require('sitemap');
const { createWriteStream } = require('fs');
const path = require('path');
const { 
  Page, 
  Destination, 
  Tour, 
  Hotel, 
  Activity, 
  Blog 
} = require('../models');

class SitemapGenerator {
  constructor(baseUrl = 'https://www.trasealla.com') {
    this.baseUrl = baseUrl;
    this.staticPages = [
      { url: '/', changefreq: 'daily', priority: 1.0 },
      { url: '/about', changefreq: 'monthly', priority: 0.8 },
      { url: '/contact', changefreq: 'monthly', priority: 0.7 },
      { url: '/destinations', changefreq: 'weekly', priority: 0.9 },
      { url: '/tours', changefreq: 'weekly', priority: 0.9 },
      { url: '/hotels', changefreq: 'weekly', priority: 0.8 },
      { url: '/flights', changefreq: 'daily', priority: 0.8 },
      { url: '/activities', changefreq: 'weekly', priority: 0.7 },
      { url: '/visa-services', changefreq: 'monthly', priority: 0.7 },
      { url: '/blog', changefreq: 'weekly', priority: 0.6 },
      { url: '/privacy-policy', changefreq: 'yearly', priority: 0.3 },
      { url: '/terms-conditions', changefreq: 'yearly', priority: 0.3 }
    ];
  }

  async generate() {
    try {
      const sitemap = new SitemapStream({ hostname: this.baseUrl });
      const writeStream = createWriteStream(
        path.join(__dirname, '../public/sitemap.xml')
      );

      sitemap.pipe(writeStream);

      // Add static pages
      for (const page of this.staticPages) {
        sitemap.write({
          url: page.url,
          changefreq: page.changefreq,
          priority: page.priority,
          lastmod: new Date().toISOString()
        });
      }

      // Add dynamic pages
      await this.addDynamicPages(sitemap);

      sitemap.end();

      await streamToPromise(sitemap);
      console.log('✅ Sitemap generated successfully');
      return true;
    } catch (error) {
      console.error('❌ Error generating sitemap:', error);
      return false;
    }
  }

  async addDynamicPages(sitemap) {
    // Add CMS pages
    const pages = await Page.findAll({
      where: { status: 'published' },
      attributes: ['slug', 'updatedAt']
    });

    pages.forEach(page => {
      sitemap.write({
        url: `/${page.slug}`,
        lastmod: page.updatedAt.toISOString(),
        changefreq: 'monthly',
        priority: 0.6
      });
    });

    // Add destinations
    const destinations = await Destination.findAll({
      where: { isActive: true },
      attributes: ['id', 'slug', 'updatedAt']
    });

    destinations.forEach(dest => {
      sitemap.write({
        url: `/destinations/${dest.slug || dest.id}`,
        lastmod: dest.updatedAt.toISOString(),
        changefreq: 'weekly',
        priority: 0.8
      });
    });

    // Add tours
    const tours = await Tour.findAll({
      where: { status: 'active' },
      attributes: ['id', 'slug', 'updatedAt']
    });

    tours.forEach(tour => {
      sitemap.write({
        url: `/tours/${tour.slug || tour.id}`,
        lastmod: tour.updatedAt.toISOString(),
        changefreq: 'weekly',
        priority: 0.7
      });
    });

    // Add hotels
    const hotels = await Hotel.findAll({
      where: { isActive: true },
      attributes: ['id', 'slug', 'updatedAt'],
      limit: 1000 // Limit to prevent huge sitemaps
    });

    hotels.forEach(hotel => {
      sitemap.write({
        url: `/hotels/${hotel.slug || hotel.id}`,
        lastmod: hotel.updatedAt.toISOString(),
        changefreq: 'weekly',
        priority: 0.6
      });
    });

    // Add activities
    const activities = await Activity.findAll({
      where: { isActive: true },
      attributes: ['id', 'slug', 'updatedAt'],
      limit: 500
    });

    activities.forEach(activity => {
      sitemap.write({
        url: `/activities/${activity.slug || activity.id}`,
        lastmod: activity.updatedAt.toISOString(),
        changefreq: 'weekly',
        priority: 0.6
      });
    });

    // Add blog posts
    const blogs = await Blog.findAll({
      where: { status: 'published' },
      attributes: ['id', 'slug', 'updatedAt']
    });

    blogs.forEach(blog => {
      sitemap.write({
        url: `/blog/${blog.slug || blog.id}`,
        lastmod: blog.updatedAt.toISOString(),
        changefreq: 'monthly',
        priority: 0.5
      });
    });

    // Add language variations
    const languages = ['en', 'ar'];
    const mainPages = ['/', '/about', '/contact', '/destinations', '/tours'];

    languages.forEach(lang => {
      if (lang !== 'en') { // English is default
        mainPages.forEach(page => {
          sitemap.write({
            url: `/${lang}${page}`,
            lastmod: new Date().toISOString(),
            changefreq: 'weekly',
            priority: 0.8,
            links: [
              { lang: 'en', url: `${this.baseUrl}${page}` },
              { lang: 'ar', url: `${this.baseUrl}/ar${page}` }
            ]
          });
        });
      }
    });
  }

  // Generate sitemap index for large sites
  async generateIndex() {
    const sitemapIndex = new SitemapStream({ 
      hostname: this.baseUrl,
      xmlns: {
        news: false,
        xhtml: true,
        image: false,
        video: false
      }
    });

    const indexStream = createWriteStream(
      path.join(__dirname, '../public/sitemap-index.xml')
    );

    sitemapIndex.pipe(indexStream);

    // Add main sitemap
    sitemapIndex.write({
      url: `${this.baseUrl}/sitemap.xml`,
      lastmod: new Date().toISOString()
    });

    // Could add more sitemaps here for very large sites
    // e.g., sitemap-destinations.xml, sitemap-tours.xml, etc.

    sitemapIndex.end();
    await streamToPromise(sitemapIndex);
  }
}

module.exports = SitemapGenerator;
