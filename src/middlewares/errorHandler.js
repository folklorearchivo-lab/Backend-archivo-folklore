const { ValidationError } = require('sequelize');
const { ZodError } = require('zod');

function notFound(req, res, next) {
  res.status(404).json({ error: 'Ruta no encontrada' });
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  // Error de JSON mal formado en la petición
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'Petición con formato JSON inválido',
    });
  }

  // Error de validación de esquemas Zod
  if (err instanceof ZodError) {
    const issues = err.issues.map((issue) => ({
      campo: issue.path.join('.') || 'petición',
      mensaje: issue.message,
    }));
    return res.status(400).json({
      error: issues.length === 1 ? issues[0].mensaje : 'Error de validación',
      errors: issues,
    });
  }

  // Error de expiración de token JWT
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'El token de sesión ha expirado' });
  }

  // Error de firma de token JWT inválido
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Token de sesión inválido' });
  }

  // Error de validación o restricciones de Sequelize
  if (err instanceof ValidationError) {
    return res.status(400).json({
      error: 'Error de base de datos / validación',
      errors: err.errors.map((e) => ({
        campo: e.path,
        mensaje: e.message,
      })),
    });
  }

  // Error de clave foránea de Sequelize
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      error: 'Error de integridad de base de datos',
      details: 'El registro referenciado no existe o está siendo utilizado.',
    });
  }

  // Error genérico del servidor
  console.error('💥 Error inesperado:', err);
  const showDetails = process.env.NODE_ENV !== 'production';
  
  res.status(err.status || 500).json({
    error: 'Error interno del servidor',
    details: showDetails ? err.message : undefined,
  });
}

module.exports = {
  errorHandler,
  notFound,
};
