const express = require('express');
const router = express.Router();
const controller = require('../controllers/parroquiasController');

router.get('/', controller.getAll);
router.get('/municipio/:id_municipio', controller.getByMunicipio);
router.get('/:id_parroquia', controller.getById);
router.post('/', controller.create);
router.put('/:id_parroquia', controller.update);
router.delete('/:id_parroquia', controller.delete);

module.exports = { path: '/parroquias', router };
