const express = require('express');
const router = express.Router();
const controller = require('../controllers/usuariosController');
const { requireAuth } = require('../middlewares/authMiddleware');
const { validateZod } = require('../middlewares/validateZod');
const { makeParamIdSchema } = require('../validators/commonSchemas');
const { usuariosCreateSchema, usuariosUpdateSchema } = require('../validators/domainSchemas');

// Rutas protegidas con autenticación
router.use(requireAuth);

router.get('/', controller.getAll);
router.get('/:id_usuario', validateZod({ params: makeParamIdSchema('id_usuario') }), controller.getById);
router.post('/', validateZod({ body: usuariosCreateSchema }), controller.create);
router.put('/:id_usuario', validateZod({ params: makeParamIdSchema('id_usuario'), body: usuariosUpdateSchema }), controller.update);
router.delete('/:id_usuario', validateZod({ params: makeParamIdSchema('id_usuario') }), controller.delete);
router.patch('/:id_usuario/toggle-activo', validateZod({ params: makeParamIdSchema('id_usuario') }), controller.toggleActivo);

module.exports = { path: '/usuarios', router };
