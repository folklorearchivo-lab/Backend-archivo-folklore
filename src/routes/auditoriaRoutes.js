const express = require('express');
const router = express.Router();
const controller = require('../controllers/auditoriaController');
const { requireAuth } = require('../middlewares/authMiddleware');

// Proteger todas las rutas de auditoría por seguridad
router.use(requireAuth);

router.get('/', controller.getAll);
router.get('/:id_log', controller.getById);
router.post('/', controller.create);
router.put('/:id_log', controller.update);
router.delete('/:id_log', controller.delete);

module.exports = { path: '/auditoria', router };
