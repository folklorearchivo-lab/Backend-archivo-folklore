const { CultorOficios } = require('../models');

// Listar todos los registros
exports.list = exports.getAll = async (req, res, next) => {
  try {
    const items = await CultorOficios.findAll();
    res.json(items);
  } catch (err) {
    next(err);
  }
};

// Obtener un registro por ID
exports.get = exports.getById = async (req, res, next) => {
  try {
    const where = {
      id_cultor: req.params.id_cultor || req.params.id,
      id_oficio: req.params.id_oficio || req.params.id,
    };
    const item = await CultorOficios.findOne({ where });
    if (!item) {
      return res.status(404).json({ error: 'Registro no encontrado en cultor_oficios' });
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
};

// Crear un registro
exports.create = async (req, res, next) => {
  try {
    const item = await CultorOficios.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

// Actualizar un registro
exports.update = async (req, res, next) => {
  try {
    const where = {
      id_cultor: req.params.id_cultor || req.params.id,
      id_oficio: req.params.id_oficio || req.params.id,
    };
    const item = await CultorOficios.findOne({ where });
    if (!item) {
      return res.status(404).json({ error: 'Registro no encontrado en cultor_oficios' });
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
    const where = {
      id_cultor: req.params.id_cultor || req.params.id,
      id_oficio: req.params.id_oficio || req.params.id,
    };
    const item = await CultorOficios.findOne({ where });
    if (!item) {
      return res.status(404).json({ error: 'Registro no encontrado en cultor_oficios' });
    }
    await item.destroy();
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
