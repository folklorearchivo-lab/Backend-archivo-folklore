const express = require('express');
const router = express.Router();
const controller = require('../controllers/rolesController');
const { requireAuth, requireRole } = require('../middlewares/authMiddleware');
const { validateZod } = require('../middlewares/validateZod');
const { makeParamIdSchema } = require('../validators/commonSchemas');
const { rolesCreateSchema, rolesUpdateSchema } = require('../validators/domainSchemas');

// Rutas de lectura (Cualquier usuario autenticado)
router.get('/', requireAuth, controller.getAll);
router.get('/:id_rol', requireAuth, validateZod({ params: makeParamIdSchema('id_rol') }), controller.getById);

// Rutas de mutación (Solo administrador)
router.post('/', requireAuth, requireRole('administrador'), validateZod({ body: rolesCreateSchema }), controller.create);
router.put('/:id_rol', requireAuth, requireRole('administrador'), validateZod({ params: makeParamIdSchema('id_rol'), body: rolesUpdateSchema }), controller.update);
router.delete('/:id_rol', requireAuth, requireRole('administrador'), validateZod({ params: makeParamIdSchema('id_rol') }), controller.delete);

module.exports = { path: '/roles', router };
