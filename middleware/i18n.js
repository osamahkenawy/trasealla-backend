/**
 * Internationalization middleware
 */
exports.detectLanguage = (req, res, next) => {
  // Check query parameter first
  if (req.query.lang) {
    req.language = req.query.lang;
  }
  // Check header
  else if (req.headers['accept-language']) {
    const languages = req.headers['accept-language']
      .split(',')
      .map(lang => lang.split(';')[0].split('-')[0]);
    
    // Support only 'en' and 'ar' for now
    req.language = languages.find(lang => ['en', 'ar'].includes(lang)) || 'en';
  }
  // Default to English
  else {
    req.language = 'en';
  }

  // Set response header
  res.setHeader('Content-Language', req.language);
  
  next();
};

/**
 * RTL support helper
 */
exports.isRTL = (language) => {
  return ['ar', 'he', 'fa', 'ur'].includes(language);
};
