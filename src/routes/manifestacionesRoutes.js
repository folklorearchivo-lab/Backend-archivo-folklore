const express = require('express');
const router = express.Router();
const controller = require('../controllers/manifestacionesController');
const { requireAuth } = require('../middlewares/authMiddleware');
const { validateZod } = require('../middlewares/validateZod');
const { makeParamIdSchema } = require('../validators/commonSchemas');
const { manifestacionesCreateSchema, manifestacionesUpdateSchema } = require('../validators/domainSchemas');

// Rutas protegidas con autenticación
router.get('/', requireAuth, controller.getAll);
router.get('/:id_manifestacion', requireAuth, validateZod({ params: makeParamIdSchema('id_manifestacion') }), controller.getById);
router.post('/', requireAuth, validateZod({ body: manifestacionesCreateSchema }), controller.create);
router.put('/:id_manifestacion', requireAuth, validateZod({ params: makeParamIdSchema('id_manifestacion'), body: manifestacionesUpdateSchema }), controller.update);
router.delete('/:id_manifestacion', requireAuth, validateZod({ params: makeParamIdSchema('id_manifestacion') }), controller.delete);

module.exports = { path: '/manifestaciones', router };
