const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Trasealla Travel Agency API',
      version: '2.0.0',
      description: 'Complete travel booking platform with Amadeus flight integration, hotels, tours, visas, and payments',
      contact: {
        name: 'Trasealla API Support',
        email: 'support@trasealla.com',
        url: 'https://www.trasealla.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5001',
        description: 'Development server'
      },
      {
        url: 'https://staging-api.trasealla.com',
        description: 'Staging server'
      },
      {
        url: 'https://api.trasealla.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token from the login endpoint'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error message'
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            email: { type: 'string', example: 'john@example.com' },
            role: { type: 'string', enum: ['customer', 'agent', 'admin'], example: 'customer' },
            status: { type: 'string', enum: ['active', 'inactive', 'suspended'], example: 'active' }
          }
        },
        FlightOffer: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '1' },
            provider: { type: 'string', example: 'Amadeus' },
            price: {
              type: 'object',
              properties: {
                currency: { type: 'string', example: 'AED' },
                grandTotal: { type: 'number', example: 3755 }
              }
            },
            itineraries: { type: 'array', items: { type: 'object' } }
          }
        },
        Booking: {
          type: 'object',
          properties: {
            bookingNumber: { type: 'string', example: 'BKG-FLT-123456' },
            status: { type: 'string', example: 'confirmed' },
            totalAmount: { type: 'number', example: 3755 },
            currency: { type: 'string', example: 'AED' }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and registration'
      },
      {
        name: 'Flights',
        description: 'Flight search and booking via Amadeus'
      },
      {
        name: 'Payments',
        description: 'Payment processing (PayTabs, Paymob, Stripe)'
      },
      {
        name: 'Users',
        description: 'User management (Admin)'
      },
      {
        name: 'Bookings',
        description: 'Booking management'
      },
      {
        name: 'Hotels',
        description: 'Hotel search and booking'
      },
      {
        name: 'Tours',
        description: 'Tour packages and activities'
      },
      {
        name: 'Visas',
        description: 'Visa application services'
      },
      {
        name: 'Contact',
        description: 'Contact and newsletter'
      }
    ]
  },
  apis: [
    './routes/*.js',
    './controllers/*.js'
  ]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
