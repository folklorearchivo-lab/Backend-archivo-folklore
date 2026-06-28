const { DocumentosCultor } = require('../models');
const { subirBuffer } = require('../services/cloudinaryService');

// Listar todos los registros
exports.list = exports.getAll = async (req, res, next) => {
  try {
    const items = await DocumentosCultor.findAll();
    res.json(items);
  } catch (err) {
    next(err);
  }
};

// Obtener un registro por ID
exports.get = exports.getById = async (req, res, next) => {
  try {
    const item = await DocumentosCultor.findByPk(req.params.id_documento || req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Registro no encontrado en documentos_cultor' });
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
};

// Crear un registro
exports.create = async (req, res, next) => {
  try {
    const item = await DocumentosCultor.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

// Actualizar un registro
exports.update = async (req, res, next) => {
  try {
    const item = await DocumentosCultor.findByPk(req.params.id_documento || req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Registro no encontrado en documentos_cultor' });
    }
    await item.update(req.body);
    res.json(item);
  } catch (err) {
    next(err);
  }
};

// Sube la foto/documento de cédula de un cultor: recibe el archivo (Multer, en memoria),
// lo envía a Cloudinary y guarda la URL resultante en documentos_cultor.
exports.uploadCedula = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Debes adjuntar un archivo de imagen.' });
    }

    const { id_cultor } = req.body;
    if (!id_cultor) {
      return res.status(400).json({ error: 'id_cultor es requerido.' });
    }

    const resultado = await subirBuffer(req.file.buffer, {
      folder: 'archivo-tachira/cedulas',
      publicId: `cultor_${id_cultor}_${Date.now()}`,
    });

    const documento = await DocumentosCultor.create({
      id_cultor,
      tipo_documento: 'cedula',
      url_archivo: resultado.secure_url,
      nombre_archivo: req.file.originalname,
      fecha_carga: new Date(),
      id_usuario_carga: req.auth?.id_usuario || null,
    });

    res.status(201).json(documento);
  } catch (err) {
    next(err);
  }
};

// Eliminar un registro
exports.remove = exports.delete = async (req, res, next) => {
  try {
    const item = await DocumentosCultor.findByPk(req.params.id_documento || req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Registro no encontrado en documentos_cultor' });
    }
    await item.destroy();
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
