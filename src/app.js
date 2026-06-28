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
// Orígenes permitidos: la web pública (vite-project) y el dashboard administrativo
// (frontend_archivo). Ambos corren con Vite en modo dev y por defecto usan el puerto
// 5173 — si los dos están abiertos al mismo tiempo, Vite asigna 5174 al segundo.
// Se listan ambos puertos para cubrir cualquiera de los dos casos.
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
];

app.use(cors({
  origin: ALLOWED_ORIGINS,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
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
