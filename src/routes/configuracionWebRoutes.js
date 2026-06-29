const express = require('express');
const router = express.Router();
const configuracionWebController = require('../controllers/configuracionWebController');
const { requireAuth, requireRole } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Obtener la configuración web (Ruta pública para el portal)
router.get('/', configuracionWebController.get);

// Actualizar la configuración web (Protegida)
router.put('/', requireAuth, requireRole('Administrador'), upload.fields([
  { name: 'hero_imagen', maxCount: 1 },
  { name: 'about_imagen', maxCount: 1 },
  { name: 'login_imagen', maxCount: 1 }
]), configuracionWebController.update);

module.exports = { path: '/configuracion-web', router };
