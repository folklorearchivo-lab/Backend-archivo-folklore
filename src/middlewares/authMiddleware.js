const { extractBearerToken, verifyAccessToken } = require('../services/jwtService');

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = extractBearerToken(authHeader);

  if (!token) {
    return res.status(401).json({ message: 'Token Bearer requerido' });
  }

  try {
    const payload = verifyAccessToken(token);
    req.auth = payload;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado', details: error.message });
  }
}

// Opcional: Middleware para restringir rutas según el rol
function requireRole(roles) {
  return (req, res, next) => {
    if (!req.auth || !req.auth.rol) {
      return res.status(401).json({ message: 'No autenticado' });
    }
    
    const allowed = Array.isArray(roles) ? roles : [roles];
    const userRole = req.auth.rol.toLowerCase();
    const allowedLower = allowed.map(r => r.toLowerCase());
    if (!allowedLower.includes(userRole)) {
      return res.status(403).json({ message: 'Acceso prohibido para este rol' });
    }
    
    return next();
  };
}

// Middleware: verifica que el usuario autenticado esté activo.
// Debe usarse DESPUÉS de requireAuth (req.auth debe existir).
// Los administradores SIEMPRE pasan (nunca se bloquean a sí mismos).
async function requireActivo(req, res, next) {
  if (!req.auth) {
    return res.status(401).json({ message: 'No autenticado' });
  }

  // Admin siempre pasa
  if (req.auth.rol && req.auth.rol.toLowerCase() === 'administrador') {
    return next();
  }

  try {
    const { Usuarios } = require('../models');
    const user = await Usuarios.findByPk(req.auth.id_usuario, {
      attributes: ['activo'],
    });

    if (!user || !user.activo) {
      return res.status(403).json({
        error: 'Su usuario está inactivo. Por favor, contacte a la administración del archivo para reactivarlo.',
      });
    }

    return next();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// Middleware: permite acceso si el usuario es administrador o si el registro de
// cultor (identificado por req.params.id_cultor o por req.auth.id_usuario) le
// pertenece. Usado en rutas donde el cultor puede editar su propio perfil.
async function requireOwnCultorOrAdmin(req, res, next) {
  if (!req.auth) {
    return res.status(401).json({ message: 'No autenticado' });
  }

  // Admin siempre pasa
  if (req.auth.rol && req.auth.rol.toLowerCase() === 'administrador') {
    return next();
  }

  try {
    const { Cultores } = require('../models');
    const idCultor = req.params.id_cultor;

    if (idCultor) {
      const cultor = await Cultores.findByPk(idCultor);
      if (!cultor) {
        return res.status(404).json({ error: 'Registro no encontrado en cultores' });
      }
      if (cultor.id_usuario !== req.auth.id_usuario) {
        return res.status(403).json({ message: 'No tienes permiso para modificar este registro' });
      }
      req.cultor = cultor;
    } else {
      // Sin id_cultor en la ruta: asumimos /mi-perfil, buscamos por id_usuario
      const cultor = await Cultores.findOne({ where: { id_usuario: req.auth.id_usuario } });
      if (!cultor) {
        return res.status(404).json({ error: 'No existe un registro de cultor vinculado a esta cuenta.' });
      }
      req.cultor = cultor;
    }

    return next();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

module.exports = {
  requireAuth,
  requireRole,
  requireOwnCultorOrAdmin,
  requireActivo,
};
