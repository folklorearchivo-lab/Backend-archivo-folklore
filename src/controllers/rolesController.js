const { Roles } = require('../models');

// Listar todos los roles
exports.list = exports.getAll = async (req, res, next) => {
  try {
    const items = await Roles.findAll({
      order: [['nombre_rol', 'ASC']],
    });
    res.json(items);
  } catch (err) {
    next(err);
  }
};

// Obtener un rol por ID
exports.get = exports.getById = async (req, res, next) => {
  try {
    const item = await Roles.findByPk(req.params.id_rol || req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Rol no encontrado' });
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
};

// Crear un rol
exports.create = async (req, res, next) => {
  try {
    const item = await Roles.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

// Actualizar un rol
exports.update = async (req, res, next) => {
  try {
    const item = await Roles.findByPk(req.params.id_rol || req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Rol no encontrado' });
    }
    await item.update(req.body);
    res.json(item);
  } catch (err) {
    next(err);
  }
};

// Eliminar un rol
exports.remove = exports.delete = async (req, res, next) => {
  try {
    const item = await Roles.findByPk(req.params.id_rol || req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Rol no encontrado' });
    }
    await item.destroy();
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
