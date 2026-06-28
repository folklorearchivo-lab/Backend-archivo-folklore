const crypto = require('crypto');
const { Cultores, Usuarios, Roles, Parroquias, sequelize } = require('../models');
const { hashPassword } = require('../services/passwordService');

const ESTATUS_VALIDOS = ['pendiente', 'aprobado', 'rechazado'];

// Campos sensibles que la web pública nunca debe recibir
const CAMPOS_OCULTOS_PUBLICO = [
  'cedula',
  'telefono_contacto',
  'correo_contacto',
  'direccion_residencia',
  'datos_censo_adicionales',
];

// Listar todos los registros (uso administrativo, requireAuth)
// Admite ?estatus=pendiente|aprobado|rechazado para filtrar; sin el query param, devuelve todo.
exports.list = exports.getAll = async (req, res, next) => {
  try {
    const { estatus } = req.query;
    const where = {};
    if (estatus) {
      if (!ESTATUS_VALIDOS.includes(estatus)) {
        return res.status(400).json({ error: `estatus inválido. Use uno de: ${ESTATUS_VALIDOS.join(', ')}` });
      }
      where.estatus = estatus;
    }
    const items = await Cultores.findAll({
      where,
      include: [{ model: Parroquias, as: 'parroquia', attributes: ['id_parroquia', 'nombre'] }],
    });
    res.json(items);
  } catch (err) {
    next(err);
  }
};

// Perfil del cultor logueado (requireAuth, cualquier usuario autenticado): busca el
// registro de Cultores vinculado a su propia cuenta vía id_usuario. Es el endpoint que
// usa la web pública para mostrar datos reales en "Mi Perfil", nunca el de otro cultor.
exports.getMiPerfil = async (req, res, next) => {
  try {
    const cultor = await Cultores.findOne({
      where: { id_usuario: req.auth.id_usuario },
      include: [{ model: Parroquias, as: 'parroquia', attributes: ['id_parroquia', 'nombre'] }],
    });
    if (!cultor) {
      return res.status(404).json({ error: 'No existe un registro de cultor vinculado a esta cuenta.' });
    }
    res.json(cultor);
  } catch (err) {
    next(err);
  }
};

// Listado público (sin auth): SIEMPRE fuerza estatus = 'aprobado' en el servidor,
// sin importar lo que el cliente intente mandar por query string. Oculta campos sensibles.
exports.getPublico = async (req, res, next) => {
  try {
    const items = await Cultores.findAll({
      where: { estatus: 'aprobado' },
      attributes: { exclude: CAMPOS_OCULTOS_PUBLICO },
    });
    res.json(items);
  } catch (err) {
    next(err);
  }
};

// Obtener un registro por ID
exports.get = exports.getById = async (req, res, next) => {
  try {
    const item = await Cultores.findByPk(req.params.id_cultor || req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Registro no encontrado en cultores' });
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
};

// Crear un registro (postulación). fecha_registro NUNCA viene del body: se fija aquí,
// mismo patrón que fecha_postulacion en obrasController.create. SIEMPRE queda
// 'pendiente' (el esquema de validación ni siquiera acepta 'estatus' del cliente) —
// esta es la ruta pública, sin auth; el auto-aprobado vive en ingresoManual.
exports.create = async (req, res, next) => {
  try {
    const item = await Cultores.create({
      ...req.body,
      fecha_registro: new Date(),
    });
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

// Crea el Usuario (rol 'cultor') vinculado a un Cultor recién aprobado: busca/crea el
// rol, genera y hashea la contraseña temporal, crea el Usuario y enlaza id_usuario.
// Devuelve { passwordTemporal } para que el caller construya la respuesta al admin.
// Compartido por updateEstatus (aprobación manual de un pendiente) e ingresoManual
// (alta directa ya aprobada) para no duplicar esta lógica en dos lugares.
async function crearUsuarioParaCultor(cultor, t) {
  let rolCultor = await Roles.findOne({ 
    where: sequelize.where(sequelize.fn('lower', sequelize.col('nombre_rol')), 'cultor'), 
    transaction: t 
  });
  if (!rolCultor) {
    rolCultor = await Roles.create(
      { nombre_rol: 'Cultor', descripcion: 'Rol de cultor' },
      { transaction: t }
    );
  }

  const passwordTemporal = crypto.randomBytes(9).toString('base64url'); // 12 chars approx.
  const password_hash = await hashPassword(passwordTemporal);

  const nuevoUsuario = await Usuarios.create(
    {
      primer_nombre: cultor.primer_nombre,
      segundo_nombre: cultor.segundo_nombre,
      primer_apellido: cultor.primer_apellido,
      segundo_apellido: cultor.segundo_apellido,
      correo: cultor.correo_contacto,
      password_hash,
      id_rol: rolCultor.id_rol,
      telefono: cultor.telefono_contacto,
      activo: true,
      fecha_registro: new Date(),
    },
    { transaction: t }
  );

  await cultor.update({ id_usuario: nuevoUsuario.id_usuario }, { transaction: t });

  return { passwordTemporal };
}

// Ingreso manual del admin: a diferencia de create() (siempre 'pendiente'), este crea
// el Cultor YA aprobado y su Usuario+contraseña en la misma transacción. Ruta protegida
// (requireAuth + requireRole admin) — nunca expuesta sin auth, porque permite
// auto-aprobación inmediata.
exports.ingresoManual = async (req, res, next) => {
  try {
    if (!req.body.correo_contacto) {
      return res.status(400).json({
        error: 'El ingreso manual requiere correo_contacto para poder crear el acceso del cultor.',
      });
    }

    let passwordTemporal;

    const cultorCreado = await sequelize.transaction(async (t) => {
      const cultor = await Cultores.create(
        { ...req.body, fecha_registro: new Date(), estatus: 'aprobado' },
        { transaction: t }
      );

      ({ passwordTemporal } = await crearUsuarioParaCultor(cultor, t));

      return cultor;
    });

    const respuesta = cultorCreado.get({ plain: true });
    respuesta.credencialesNuevas = {
      correo: cultorCreado.correo_contacto,
      nombre: `${cultorCreado.primer_nombre} ${cultorCreado.primer_apellido}`,
      passwordTemporal,
    };

    res.status(201).json(respuesta);
  } catch (err) {
    next(err);
  }
};

// Actualizar un registro
exports.update = async (req, res, next) => {
  try {
    const item = await Cultores.findByPk(req.params.id_cultor || req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Registro no encontrado en cultores' });
    }
    await item.update(req.body);
    res.json(item);
  } catch (err) {
    next(err);
  }
};

// Cambiar el estatus (aprobar/rechazar). Acción dedicada y auditable, separada del PUT genérico.
// Al aprobar por primera vez, crea automáticamente el Usuario (rol 'cultor') vinculado
// al registro, dentro de una transacción, y le envía sus credenciales por correo.
exports.updateEstatus = async (req, res, next) => {
  const { estatus } = req.body;

  try {
    const cultor = await Cultores.findByPk(req.params.id_cultor);
    if (!cultor) {
      return res.status(404).json({ error: 'Registro no encontrado en cultores' });
    }

    // Validación inicial: sin correo no hay a quién crearle cuenta ni notificar.
    if (estatus === 'aprobado' && !cultor.id_usuario && !cultor.correo_contacto) {
      return res.status(400).json({
        error: 'No se puede aprobar automáticamente: el cultor no tiene correo_contacto registrado.',
      });
    }

    let credencialesNuevas = null; // { correo, passwordTemporal } solo si se crea un usuario nuevo

    const cultorActualizado = await sequelize.transaction(async (t) => {
      // Doble aprobación / re-aprobación tras un rechazo: el usuario ya existe, no se duplica.
      if (estatus === 'aprobado' && !cultor.id_usuario) {
        const { passwordTemporal } = await crearUsuarioParaCultor(cultor, t);
        await cultor.update({ estatus }, { transaction: t });
        credencialesNuevas = { correo: cultor.correo_contacto, passwordTemporal };
      } else {
        await cultor.update({ estatus }, { transaction: t });
      }

      return cultor;
    });

    // El envío de correo se migró a EmailJS en el frontend: el backend ya no manda
    // nada por SMTP. Si se creó un usuario nuevo, se devuelve la contraseña temporal
    // en texto plano SOLO en esta respuesta puntual, para que el dashboard del admin
    // dispare la plantilla de credenciales hacia el correo del cultor.
    const respuesta = cultorActualizado.get({ plain: true });
    if (credencialesNuevas) {
      respuesta.credencialesNuevas = {
        correo: credencialesNuevas.correo,
        nombre: `${cultor.primer_nombre} ${cultor.primer_apellido}`,
        passwordTemporal: credencialesNuevas.passwordTemporal,
      };
    }

    res.json(respuesta);
  } catch (err) {
    next(err);
  }
};

// Eliminar un registro
exports.remove = exports.delete = async (req, res, next) => {
  try {
    const item = await Cultores.findByPk(req.params.id_cultor || req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Registro no encontrado en cultores' });
    }
    await item.destroy();
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
