const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MeCare Healthcare API',
      version: '1.0.0',
      description: 'API documentation for MeCare Healthcare Appointment System',
    },
    servers: [
      {
        url: 'https://mecare-frontend.vercel.app',
        description: 'Development server',
      },
      {
        url: 'https://mecare-backend.onrender.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{
      bearerAuth: [],
    }],
  },
  apis: ['./routes/*.js', './controllers/*.js'], // Path to the API docs
};

const specs = swaggerJsdoc(options);

module.exports = specs; 