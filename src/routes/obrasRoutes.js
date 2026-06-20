const express = require('express');
const router = express.Router();
const controller = require('../controllers/obrasController');
const { requireAuth } = require('../middlewares/authMiddleware');
const { validateZod } = require('../middlewares/validateZod');
const { makeParamIdSchema } = require('../validators/commonSchemas');
const { obrasCreateSchema, obrasUpdateSchema } = require('../validators/domainSchemas');

// Rutas protegidas con autenticación
router.get('/', requireAuth, controller.getAll);
router.get('/:id_obra', requireAuth, validateZod({ params: makeParamIdSchema('id_obra') }), controller.getById);
router.post('/', requireAuth, validateZod({ body: obrasCreateSchema }), controller.create);
router.put('/:id_obra', requireAuth, validateZod({ params: makeParamIdSchema('id_obra'), body: obrasUpdateSchema }), controller.update);
router.delete('/:id_obra', requireAuth, validateZod({ params: makeParamIdSchema('id_obra') }), controller.delete);

module.exports = { path: '/obras', router };
