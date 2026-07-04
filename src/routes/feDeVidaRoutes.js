const express = require('express');
const router = express.Router();
const controller = require('../controllers/feDeVidaController');
const { requireAuth, requireRole } = require('../middlewares/authMiddleware');

// Registros de fe de vida (miembro activo/honorario): datos administrativos del
// patrimonio vivo, nunca expuestos sin sesión.
router.use(requireAuth);

router.get('/', controller.getAll);
router.get('/:id_fe_vida', controller.getById);
router.post('/', requireRole('administrador'), controller.create);
router.put('/:id_fe_vida', requireRole('administrador'), controller.update);
router.delete('/:id_fe_vida', requireRole('administrador'), controller.delete);

module.exports = { path: '/fe_de_vida', router };
