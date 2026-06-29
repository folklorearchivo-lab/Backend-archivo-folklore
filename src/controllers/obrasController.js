const { Obras, Multimedia, Cultores, CategoriasObra } = require('../models');

const ESTATUS_VALIDOS = ['pendiente', 'aprobado', 'rechazado', 'eliminado'];
const { Op } = require('sequelize');

// Listar todos los registros (uso administrativo, requireAuth)
// Admite ?estatus=pendiente|aprobado|rechazado|eliminado para filtrar; sin el query param, devuelve todo excepto 'eliminado'.
exports.list = exports.getAll = async (req, res, next) => {
  try {
    const { estatus } = req.query;
    const where = {};
    if (estatus) {
      if (!ESTATUS_VALIDOS.includes(estatus)) {
        return res.status(400).json({ error: `estatus inválido. Use uno de: ${ESTATUS_VALIDOS.join(', ')}` });
      }
      where.estatus = estatus;
    } else {
      where.estatus = { [Op.ne]: 'eliminado' };
    }
    const items = await Obras.findAll({
      where,
      include: [
        { model: Multimedia, as: 'multimedia' },
        { model: Cultores, as: 'cultor' },
        { model: CategoriasObra, as: 'categoria' }
      ]
    });
    res.json(items);
  } catch (err) {
    next(err);
  }
};

exports.getPublico = async (req, res, next) => {
  try {
    const items = await Obras.findAll({
      where: { estatus: 'aprobado' },
      attributes: { exclude: ['observaciones_admin'] },
      include: [
        { model: Multimedia, as: 'multimedia' },
        { model: Cultores, as: 'cultor' }
      ]
    });
    res.json(items);
  } catch (err) {
    next(err);
  }
};

// Obtener un registro por ID
exports.get = exports.getById = async (req, res, next) => {
  try {
    const item = await Obras.findByPk(req.params.id_obra || req.params.id, {
      include: [
        { model: Multimedia, as: 'multimedia' },
        { model: Cultores, as: 'cultor' },
        { model: CategoriasObra, as: 'categoria' }
      ]
    });
    if (!item) {
      return res.status(404).json({ error: 'Registro no encontrado en obras' });
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
};

// Crear un registro (postulación). estatus/observaciones_admin/fecha_aprobacion
// e id_usuario_registro NUNCA vienen del body: el esquema de validación ya los excluye,
// y aquí se fija explícitamente quién registra y cuándo se postuló.
exports.create = async (req, res, next) => {
  try {
    // Calcular el siguiente código correlativo de inventario (ej. IP-003)
    const allPieces = await Obras.findAll({ attributes: ['codigo_qr_link'] });
    let maxNum = 0;
    allPieces.forEach(p => {
      if (p.codigo_qr_link && p.codigo_qr_link.toUpperCase().startsWith('IP-')) {
        const num = parseInt(p.codigo_qr_link.toUpperCase().replace('IP-', ''), 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    });
    const nextCode = `IP-${String(maxNum + 1).padStart(3, '0')}`;

    const isValidador = req.auth?.rol?.toLowerCase() === 'administrador';
    const estatusInicial = isValidador ? 'aprobado' : 'pendiente';

    const item = await Obras.create({
      ...req.body,
      codigo_qr_link: nextCode,
      id_usuario_registro: req.auth?.id_usuario ?? null,
      fecha_postulacion: new Date(),
      estatus: estatusInicial,
    });
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

// Actualizar un registro
exports.update = async (req, res, next) => {
  try {
    const item = await Obras.findByPk(req.params.id_obra || req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Registro no encontrado en obras' });
    }
    await item.update(req.body);
    res.json(item);
  } catch (err) {
    next(err);
  }
};

// Cambiar el estatus (aprobar/rechazar). Acción dedicada y auditable, separada del PUT genérico.
exports.updateEstatus = async (req, res, next) => {
  try {
    const item = await Obras.findByPk(req.params.id_obra);
    if (!item) {
      return res.status(404).json({ error: 'Registro no encontrado en obras' });
    }
    const fechaAprobacion = req.body.estatus === 'aprobado' ? new Date() : item.fecha_aprobacion;
    await item.update({ estatus: req.body.estatus, fecha_aprobacion: fechaAprobacion });
    res.json(item);
  } catch (err) {
    next(err);
  }
};

// Eliminar un registro (Eliminación Lógica)
exports.remove = exports.delete = async (req, res, next) => {
  try {
    const item = await Obras.findByPk(req.params.id_obra || req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Registro no encontrado en obras' });
    }
    await item.update({ estatus: 'eliminado' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

// Actualizar el campo destacado_galeria
exports.updateDestacado = async (req, res, next) => {
  try {
    const item = await Obras.findByPk(req.params.id_obra);
    if (!item) {
      return res.status(404).json({ error: 'Obra no encontrada' });
    }
    const { destacado_galeria } = req.body;
    await item.update({ destacado_galeria });
    res.json(item);
  } catch (err) {
    next(err);
  }
};
