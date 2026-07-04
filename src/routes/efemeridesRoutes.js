const express = require('express');
const router = express.Router();
const controller = require('../controllers/efemeridesController');
const { requireAuth, requireRole } = require('../middlewares/authMiddleware');
const { validateZod } = require('../middlewares/validateZod');
const { makeParamIdSchema } = require('../validators/commonSchemas');
const { efemeridesCreateSchema, efemeridesUpdateSchema } = require('../validators/domainSchemas');
const upload = require('../middlewares/uploadMiddleware');

// Pública (sin auth): la web solo muestra las activas. Debe ir antes de '/' para
// no chocar con las rutas administrativas de abajo.
router.get('/publicas', controller.getPublicas);

// Administrativas
router.get('/', requireAuth, controller.getAll);
router.get('/:id_efemeride', requireAuth, validateZod({ params: makeParamIdSchema('id_efemeride') }), controller.getById);
router.post('/', requireAuth, requireRole('administrador'), upload.single('imagen'), validateZod({ body: efemeridesCreateSchema }), controller.create);
router.put('/:id_efemeride', requireAuth, requireRole('administrador'), upload.single('imagen'), validateZod({ params: makeParamIdSchema('id_efemeride'), body: efemeridesUpdateSchema }), controller.update);
router.delete('/:id_efemeride', requireAuth, requireRole('administrador'), validateZod({ params: makeParamIdSchema('id_efemeride') }), controller.remove);

module.exports = { path: '/efemerides', router };
