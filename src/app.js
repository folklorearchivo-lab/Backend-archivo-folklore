const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middlewares/errorHandler');

const app = express();

// Middlewares de seguridad y logs
app.use(helmet());
app.use(cors({
  origin: '*', // Permitir peticiones desde cualquier origen (configurable)
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('dev'));

// Parsear cuerpo de peticiones
app.use(express.json({ limit: '1mb', strict: true }));
app.use(express.urlencoded({ extended: true }));

// Documentación de API interactiva Swagger
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rutas de la API
app.use('/api', routes);

// Middleware para rutas inexistentes
app.use(notFound);

// Manejador centralizado de errores
app.use(errorHandler);

module.exports = app;
