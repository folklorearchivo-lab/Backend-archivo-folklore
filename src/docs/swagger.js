const path = require('path');
const swaggerJSDoc = require('swagger-jsdoc');

const spec = swaggerJSDoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Archivo Folklore API',
      version: '1.0.0',
      description: 'Documentación interactiva de la API para el Archivo Folklore',
    },
    servers: [
      {
        url: '/api',
        description: 'Servidor local de desarrollo',
      },
    ],
    security: [
      {
        bearerAuth: [],
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
  },
  apis: [path.join(__dirname, '..', 'routes', '*.js').replace(/\\/g, '/')],
});

module.exports = spec;
