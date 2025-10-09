/**
 * Duffel API Configuration
 * Modern flight booking platform
 * 
 * Get your API key:
 * 1. Sign up at https://duffel.com
 * 2. Go to Settings → API Keys
 * 3. Create a new key
 * 4. Copy to .env file
 */

module.exports = {
  apiKey: process.env.DUFFEL_API_KEY || 'duffel_test_...',
  environment: process.env.DUFFEL_ENV || 'test',
  baseUrl: 'https://api.duffel.com',
  version: 'v1'
};
