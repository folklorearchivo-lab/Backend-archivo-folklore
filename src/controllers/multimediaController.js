const { Multimedia } = require('../models');
const { subirBuffer } = require('../services/cloudinaryService');

// Listar todos los registros
exports.list = exports.getAll = async (req, res, next) => {
  try {
    const items = await Multimedia.findAll();
    res.json(items);
  } catch (err) {
    next(err);
  }
};

// Obtener un registro por ID
exports.get = exports.getById = async (req, res, next) => {
  try {
    const item = await Multimedia.findByPk(req.params.id_multimedia || req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Registro no encontrado en multimedia' });
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
};

// Crear un registro
exports.create = async (req, res, next) => {
  try {
    const item = await Multimedia.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

// Actualizar un registro
exports.update = async (req, res, next) => {
  try {
    const item = await Multimedia.findByPk(req.params.id_multimedia || req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Registro no encontrado en multimedia' });
    }
    await item.update(req.body);
    res.json(item);
  } catch (err) {
    next(err);
  }
};

// Eliminar un registro
exports.remove = exports.delete = async (req, res, next) => {
  try {
    const item = await Multimedia.findByPk(req.params.id_multimedia || req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Registro no encontrado en multimedia' });
    }
    await item.destroy();
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

// Subir un archivo multimedia a Cloudinary y asociarlo a una obra
exports.uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Debe subir un archivo' });
    }

    const { id_obra, tipo_archivo, descripcion, es_portada } = req.body;

    const resCloud = await subirBuffer(req.file.buffer, {
      folder: 'archivo-tachira/multimedia',
      publicId: `obra_${id_obra || 'temp'}_${Date.now()}`
    });

    const item = await Multimedia.create({
      tipo_archivo: tipo_archivo || 'imagen',
      url_archivo: resCloud.secure_url,
      nombre_archivo: req.file.originalname,
      descripcion: descripcion || '',
      id_obra: id_obra ? parseInt(id_obra, 10) : null,
      es_portada: es_portada || 'si',
      fecha_carga: new Date(),
      id_usuario_carga: req.auth?.id_usuario || null
    });

    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};
