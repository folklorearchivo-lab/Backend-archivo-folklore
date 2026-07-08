const express = require('express');
const router = express.Router();
const controller = require('../controllers/obrasController');
const { requireAuth, requireRole, requireActivo, requireOwnObraOrAdmin } = require('../middlewares/authMiddleware');
const { validateZod } = require('../middlewares/validateZod');
const { makeParamIdSchema } = require('../validators/commonSchemas');
const { obrasCreateSchema, obrasUpdateSchema, estatusSchema } = require('../validators/domainSchemas');
const upload = require('../middlewares/uploadMiddleware');

// Ruta pública (sin auth): la web pública solo ve obras ya aprobadas.
// Debe declararse ANTES de '/:id_obra' para que Express no la confunda con un id.
router.get('/publico', controller.getPublico);

// Rutas administrativas de lectura (acepta ?estatus= para filtrar, ver controller)
router.get('/', requireAuth, controller.getAll);
router.get('/:id_obra', requireAuth, validateZod({ params: makeParamIdSchema('id_obra') }), controller.getById);

// Postulación de una obra: requiere sesión ACTIVA (cultor o admin); el estatus queda 'pendiente' por default en BD.
// La imagen es obligatoria cuando postula el propio cultor (ver obrasController.create) — se sube en esta
// misma petición multipart, dentro de una transacción junto con la obra.
router.post('/', requireAuth, requireActivo, upload.single('archivo'), validateZod({ body: obrasCreateSchema }), controller.create);

// Rutas de escritura protegidas. requireOwnObraOrAdmin: un cultor solo puede modificar/eliminar
// su propia obra (antes solo exigían estar logueado y activo, sin revisar dueño).
router.put('/:id_obra', requireAuth, requireActivo, requireOwnObraOrAdmin, validateZod({ params: makeParamIdSchema('id_obra'), body: obrasUpdateSchema }), controller.update);
router.patch('/:id_obra/estatus', requireAuth, requireRole('Administrador'), validateZod({ params: makeParamIdSchema('id_obra'), body: estatusSchema }), controller.updateEstatus);
router.patch('/:id_obra/destacado', requireAuth, requireRole('Administrador'), controller.updateDestacado);
router.delete('/:id_obra', requireAuth, requireActivo, requireOwnObraOrAdmin, validateZod({ params: makeParamIdSchema('id_obra') }), controller.delete);
router.post('/:id_obra/delete', requireAuth, requireActivo, requireOwnObraOrAdmin, controller.deleteWithPassword);

// Reemplazar la foto de una obra ya existente (autoservicio del cultor sobre su propia
// obra, o admin). requireOwnObraOrAdmin ya valida dueño antes de llegar aquí.
router.post('/:id_obra/foto', requireAuth, requireActivo, requireOwnObraOrAdmin, upload.single('archivo'), controller.reemplazarFoto);

module.exports = { path: '/obras', router };