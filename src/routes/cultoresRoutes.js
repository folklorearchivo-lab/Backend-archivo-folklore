const express = require('express');
const router = express.Router();
const controller = require('../controllers/cultoresController');
const { requireAuth } = require('../middlewares/authMiddleware');
const { validateZod } = require('../middlewares/validateZod');
const { makeParamIdSchema } = require('../validators/commonSchemas');
const { cultoresCreateSchema, cultoresUpdateSchema } = require('../validators/domainSchemas');

// Rutas públicas de lectura (opcional, pero las protegemos para mayor seguridad)
router.get('/', requireAuth, controller.getAll);
router.get('/:id_cultor', requireAuth, validateZod({ params: makeParamIdSchema('id_cultor') }), controller.getById);

// Rutas de escritura protegidas
router.post('/', requireAuth, validateZod({ body: cultoresCreateSchema }), controller.create);
router.put('/:id_cultor', requireAuth, validateZod({ params: makeParamIdSchema('id_cultor'), body: cultoresUpdateSchema }), controller.update);
router.delete('/:id_cultor', requireAuth, validateZod({ params: makeParamIdSchema('id_cultor') }), controller.delete);

module.exports = { path: '/cultores', router };
