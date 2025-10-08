const { Page, MediaLibrary, Translation, AuditLog } = require('../models');
const { Op } = require('sequelize');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join('uploads', 'media', new Date().getFullYear().toString(), (new Date().getMonth() + 1).toString().padStart(2, '0'));
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/mpeg',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Export upload middleware
exports.uploadMedia = upload.single('file');

/**
 * Get all pages
 */
exports.getPages = async (req, res) => {
  try {
    const { status, showInMenu, parentId, search } = req.query;
    
    const where = {};
    if (status) where.status = status;
    if (showInMenu !== undefined) where.showInMenu = showInMenu === 'true';
    if (parentId !== undefined) where.parentId = parentId === 'null' ? null : parentId;
    
    if (search) {
      where[Op.or] = [
        { 'title.en': { [Op.like]: `%${search}%` } },
        { 'title.ar': { [Op.like]: `%${search}%` } },
        { slug: { [Op.like]: `%${search}%` } }
      ];
    }

    const pages = await Page.findAll({
      where,
      include: [
        {
          model: Page,
          as: 'parent',
          attributes: ['id', 'title', 'slug']
        },
        {
          model: Page,
          as: 'children',
          attributes: ['id', 'title', 'slug', 'menuOrder', 'showInMenu'],
          where: { status: 'published' },
          required: false
        }
      ],
      order: [['menuOrder', 'ASC'], ['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: pages
    });
  } catch (error) {
    console.error('Get pages error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pages'
    });
  }
};

/**
 * Get page by slug
 */
exports.getPageBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const { lang = 'en' } = req.query;

    const page = await Page.findOne({
      where: { 
        slug,
        status: 'published'
      },
      include: [
        {
          model: Page,
          as: 'parent',
          attributes: ['id', 'title', 'slug']
        },
        {
          model: Page,
          as: 'children',
          attributes: ['id', 'title', 'slug', 'menuOrder'],
          where: { status: 'published' },
          required: false,
          order: [['menuOrder', 'ASC']]
        }
      ]
    });

    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Page not found'
      });
    }

    // Return localized content
    const localizedPage = {
      ...page.toJSON(),
      title: page.title[lang] || page.title.en,
      content: page.content[lang] || page.content.en,
      metaTitle: page.metaTitle?.[lang] || page.metaTitle?.en,
      metaDescription: page.metaDescription?.[lang] || page.metaDescription?.en,
      metaKeywords: page.metaKeywords?.[lang] || page.metaKeywords?.en
    };

    res.json({
      success: true,
      data: localizedPage
    });
  } catch (error) {
    console.error('Get page error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching page'
    });
  }
};

/**
 * Create new page (Admin only)
 */
exports.createPage = async (req, res) => {
  try {
    const {
      slug, title, content, metaTitle, metaDescription,
      metaKeywords, ogImage, template, sections,
      showInMenu, menuOrder, parentId
    } = req.body;

    // Check if slug already exists
    const existingPage = await Page.findOne({ where: { slug } });
    if (existingPage) {
      return res.status(400).json({
        success: false,
        message: 'Page slug already exists'
      });
    }

    const page = await Page.create({
      slug,
      title,
      content,
      metaTitle,
      metaDescription,
      metaKeywords,
      ogImage,
      template,
      sections,
      showInMenu,
      menuOrder,
      parentId,
      authorId: req.user.id,
      status: 'draft'
    });

    // Log creation
    await AuditLog.create({
      userId: req.user.id,
      action: 'CREATE',
      entity: 'page',
      entityId: page.id,
      metadata: { ip: req.ip, userAgent: req.headers['user-agent'] }
    });

    res.status(201).json({
      success: true,
      message: 'Page created successfully',
      data: page
    });
  } catch (error) {
    console.error('Create page error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating page'
    });
  }
};

/**
 * Update page (Admin only)
 */
exports.updatePage = async (req, res) => {
  try {
    const page = await Page.findByPk(req.params.id);

    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Page not found'
      });
    }

    const oldValues = page.toJSON();

    const allowedUpdates = [
      'title', 'content', 'metaTitle', 'metaDescription',
      'metaKeywords', 'ogImage', 'template', 'sections',
      'showInMenu', 'menuOrder', 'parentId'
    ];

    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    await page.update(updates);

    // Log update
    await AuditLog.create({
      userId: req.user.id,
      action: 'UPDATE',
      entity: 'page',
      entityId: page.id,
      changes: {
        old: oldValues,
        new: page.toJSON()
      },
      metadata: { ip: req.ip, userAgent: req.headers['user-agent'] }
    });

    res.json({
      success: true,
      message: 'Page updated successfully',
      data: page
    });
  } catch (error) {
    console.error('Update page error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating page'
    });
  }
};

/**
 * Publish page (Admin only)
 */
exports.publishPage = async (req, res) => {
  try {
    const page = await Page.findByPk(req.params.id);

    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Page not found'
      });
    }

    await page.update({
      status: 'published',
      publishedAt: new Date()
    });

    // Log publish
    await AuditLog.create({
      userId: req.user.id,
      action: 'UPDATE',
      entity: 'page',
      entityId: page.id,
      changes: { status: { old: page.status, new: 'published' } },
      metadata: { ip: req.ip, userAgent: req.headers['user-agent'] }
    });

    res.json({
      success: true,
      message: 'Page published successfully',
      data: page
    });
  } catch (error) {
    console.error('Publish page error:', error);
    res.status(500).json({
      success: false,
      message: 'Error publishing page'
    });
  }
};

/**
 * Delete page (Admin only)
 */
exports.deletePage = async (req, res) => {
  try {
    const page = await Page.findByPk(req.params.id);

    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Page not found'
      });
    }

    // Check if page has children
    const childCount = await Page.count({ where: { parentId: page.id } });
    if (childCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete page with child pages'
      });
    }

    // Archive instead of hard delete
    await page.update({ status: 'archived' });

    // Log deletion
    await AuditLog.create({
      userId: req.user.id,
      action: 'DELETE',
      entity: 'page',
      entityId: page.id,
      metadata: { ip: req.ip, userAgent: req.headers['user-agent'] }
    });

    res.json({
      success: true,
      message: 'Page deleted successfully'
    });
  } catch (error) {
    console.error('Delete page error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting page'
    });
  }
};

/**
 * Upload media file
 */
exports.uploadMediaFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { file } = req;
    const { folder = 'general', altText, caption } = req.body;

    // Determine file type
    let type = 'other';
    if (file.mimetype.startsWith('image/')) type = 'image';
    else if (file.mimetype.startsWith('video/')) type = 'video';
    else if (file.mimetype === 'application/pdf') type = 'document';

    // Create media library entry
    const media = await MediaLibrary.create({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: `/${file.path.replace(/\\/g, '/')}`,
      type,
      folder,
      altText: altText ? JSON.parse(altText) : null,
      caption: caption ? JSON.parse(caption) : null,
      uploadedBy: req.user.id
    });

    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: media
    });
  } catch (error) {
    console.error('Upload media error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error uploading file'
    });
  }
};

/**
 * Get media library
 */
exports.getMediaLibrary = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, folder, search } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (type) where.type = type;
    if (folder) where.folder = folder;
    if (search) {
      where[Op.or] = [
        { originalName: { [Op.like]: `%${search}%` } },
        { 'altText.en': { [Op.like]: `%${search}%` } },
        { 'altText.ar': { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows: media } = await MediaLibrary.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: media,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get media library error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching media library'
    });
  }
};

/**
 * Delete media file
 */
exports.deleteMediaFile = async (req, res) => {
  try {
    const media = await MediaLibrary.findByPk(req.params.id);

    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media file not found'
      });
    }

    // Delete physical file
    try {
      await fs.unlink(media.url.substring(1)); // Remove leading slash
    } catch (err) {
      console.error('Error deleting physical file:', err);
    }

    // Delete database record
    await media.destroy();

    res.json({
      success: true,
      message: 'Media file deleted successfully'
    });
  } catch (error) {
    console.error('Delete media error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting media file'
    });
  }
};

/**
 * Get translations
 */
exports.getTranslations = async (req, res) => {
  try {
    const { namespace = 'common', language = 'en' } = req.query;

    const translations = await Translation.findAll({
      where: { namespace, language },
      order: [['key', 'ASC']]
    });

    // Convert to key-value object
    const translationMap = {};
    translations.forEach(t => {
      translationMap[t.key] = t.value;
    });

    res.json({
      success: true,
      data: translationMap
    });
  } catch (error) {
    console.error('Get translations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching translations'
    });
  }
};

/**
 * Update translation (Admin only)
 */
exports.updateTranslation = async (req, res) => {
  try {
    const { key, namespace = 'common', language, value } = req.body;

    const [translation, created] = await Translation.findOrCreate({
      where: { key, namespace, language },
      defaults: { value }
    });

    if (!created) {
      await translation.update({ 
        value,
        isReviewed: true,
        reviewedBy: req.user.id,
        reviewedAt: new Date()
      });
    }

    res.json({
      success: true,
      message: 'Translation updated successfully',
      data: translation
    });
  } catch (error) {
    console.error('Update translation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating translation'
    });
  }
};
