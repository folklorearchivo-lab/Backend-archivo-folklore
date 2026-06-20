const { Auditoria } = require('../models');

// Listar todos los registros
exports.list = exports.getAll = async (req, res, next) => {
  try {
    const items = await Auditoria.findAll();
    res.json(items);
  } catch (err) {
    next(err);
  }
};

// Obtener un registro por ID
exports.get = exports.getById = async (req, res, next) => {
  try {
    const item = await Auditoria.findByPk(req.params.id_log || req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Registro no encontrado en auditoria' });
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
};

// Crear un registro
exports.create = async (req, res, next) => {
  try {
    const item = await Auditoria.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

// Actualizar un registro
exports.update = async (req, res, next) => {
  try {
    const item = await Auditoria.findByPk(req.params.id_log || req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Registro no encontrado en auditoria' });
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
    const item = await Auditoria.findByPk(req.params.id_log || req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Registro no encontrado en auditoria' });
    }
    await item.destroy();
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
