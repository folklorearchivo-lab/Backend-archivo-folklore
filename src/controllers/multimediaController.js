const { Multimedia } = require('../models');

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
