const { DocumentosCultor } = require('../models');
const { subirBuffer } = require('../services/cloudinaryService');
const { validarCedula } = require('../services/ocrService');

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

// Valida mediante OCR que la imagen sea una Cédula de Identidad venezolana,
// SIN crear ningún registro. Útil para validar antes de enviar el formulario.
exports.validarCedulaImagen = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Debes adjuntar un archivo de imagen.' });
    }

    const { valido, coincidencias, cedulaExtraida, nombresExtraidos } = await validarCedula(req.file.buffer);

    if (!valido) {
      const motivos = [];
      if (!coincidencias.palabrasClave) {
        motivos.push('No se encontraron las frases "REPÚBLICA BOLIVARIANA DE VENEZUELA" o "CÉDULA DE IDENTIDAD"');
      }
      if (!coincidencias.numeroIdentidad) {
        motivos.push('No se encontró un número de cédula con formato V-12345678 o E-12345678');
      }
      return res.status(422).json({
        error: 'La imagen proporcionada no parece ser una Cédula de Identidad venezolana válida.',
        detalles: motivos,
      });
    }

    res.json({
      valido: true,
      message: 'La imagen corresponde a una Cédula de Identidad válida.',
      cedulaExtraida,
      nombresExtraidos,
    });
  } catch (err) {
    if (err.ocrFallo) {
      return res.status(err.status || 422).json({ error: err.message });
    }
    next(err);
  }
};

// Sube la foto/documento de cédula de un cultor: recibe el archivo (Multer, en memoria),
// lo valida mediante OCR, lo envía a Cloudinary y guarda la URL resultante en documentos_cultor.
exports.uploadCedula = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Debes adjuntar un archivo de imagen.' });
    }

    const { id_cultor } = req.body;
    if (!id_cultor) {
      return res.status(400).json({ error: 'id_cultor es requerido.' });
    }

    const resultadoOcr = await validarCedula(req.file.buffer);

    if (!resultadoOcr.valido) {
      const motivos = [];
      if (!resultadoOcr.coincidencias.palabrasClave) {
        motivos.push('No se encontraron las frases "REPÚBLICA BOLIVARIANA DE VENEZUELA" o "CÉDULA DE IDENTIDAD"');
      }
      if (!resultadoOcr.coincidencias.numeroIdentidad) {
        motivos.push('No se encontró un número de cédula con formato V-12345678 o E-12345678');
      }
      return res.status(422).json({
        error: 'La imagen proporcionada no parece ser una Cédula de Identidad venezolana válida.',
        detalles: motivos,
      });
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
    if (err.ocrFallo) {
      return res.status(err.status || 422).json({ error: err.message });
    }
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
