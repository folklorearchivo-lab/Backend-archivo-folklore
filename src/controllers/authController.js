const { Usuarios, Roles } = require('../models');
const { hashPassword, verifyPassword } = require('../services/passwordService');
const { signAccessToken } = require('../services/jwtService');
const emailService = require('../services/emailService');

const register = async (req, res, next) => {
  try {
    const { primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, correo, password, id_rol, telefono } = req.body;

    if (!correo || !password || !primer_nombre || !primer_apellido) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const existingUser = await Usuarios.findOne({ where: { correo } });
    if (existingUser) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }

    // Determinar id_rol
    let activeIdRol = id_rol;
    if (!activeIdRol) {
      const roleObj = await Roles.findOne({ where: { nombre_rol: 'usuario' } });
      if (roleObj) {
        activeIdRol = roleObj.id_rol;
      }
    }

    const password_hash = await hashPassword(password);

    const newUser = await Usuarios.create({
      primer_nombre,
      segundo_nombre: segundo_nombre || null,
      primer_apellido,
      segundo_apellido: segundo_apellido || null,
      correo,
      password_hash,
      id_rol: activeIdRol || null,
      telefono: telefono || null,
      activo: true,
      fecha_registro: new Date(),
    });

    const userWithRole = await Usuarios.findByPk(newUser.id_usuario, {
      include: [{ model: Roles, as: 'rolRel' }]
    });

    const plainUser = userWithRole.get({ plain: true });
    delete plainUser.password_hash;

    // Enviar email de bienvenida en segundo plano
    const welcomeName = `${plainUser.primer_nombre} ${plainUser.primer_apellido}`;
    emailService.sendWelcomeEmail(plainUser.correo, welcomeName)
      .catch(err => console.error('Error enviando email de bienvenida:', err));

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: plainUser,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const user = await Usuarios.findOne({
      where: { correo },
      include: [{ model: Roles, as: 'rolRel' }]
    });

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    if (!user.activo) {
      return res.status(401).json({ error: 'El usuario está inactivo' });
    }

    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Actualizar la fecha de último acceso
    await user.update({ ultimo_acceso: new Date() });

    const plainUser = user.get({ plain: true });
    delete plainUser.password_hash;

    const token = signAccessToken({
      id_usuario: plainUser.id_usuario,
      correo: plainUser.correo,
      rol: user.rolRel ? user.rolRel.nombre_rol : 'usuario',
    });

    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      user: plainUser,
      token,
    });
  } catch (error) {
    next(error);
  }
};

const verifyToken = (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const { verifyAccessToken } = require('../services/jwtService');
    const decoded = verifyAccessToken(token);
    res.status(200).json({ message: 'Token válido', user: decoded });
  } catch (error) {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { correo } = req.body;
    const user = await Usuarios.findOne({ where: { correo } });
    if (!user) {
      return res.status(200).json({
        message: 'Si el correo está registrado, recibirás un token de recuperación pronto.'
      });
    }

    const resetToken = signAccessToken(
      { id_usuario: user.id_usuario, type: 'password-reset' },
      { expiresIn: '1h' }
    );

    const welcomeName = `${user.primer_nombre} ${user.primer_apellido}`;
    await emailService.sendResetPasswordEmail(user.correo, welcomeName, resetToken);

    res.status(200).json({
      message: 'Si el correo está registrado, recibirás un token de recuperación pronto.'
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    let decoded;
    try {
      const { verifyAccessToken } = require('../services/jwtService');
      decoded = verifyAccessToken(token);
    } catch (err) {
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }

    if (decoded.type !== 'password-reset') {
      return res.status(400).json({ error: 'Token inválido para esta operación' });
    }

    const user = await Usuarios.findByPk(decoded.id_usuario);
    if (!user || !user.activo) {
      return res.status(404).json({ error: 'Usuario no encontrado o inactivo' });
    }

    const new_password_hash = await hashPassword(newPassword);
    await user.update({ password_hash: new_password_hash });

    res.status(200).json({ message: 'Contraseña restablecida exitosamente' });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    if (!req.auth || !req.auth.id_usuario) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const user = await Usuarios.findByPk(req.auth.id_usuario, {
      include: [{ model: Roles, as: 'rolRel' }]
    });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const plainUser = user.get({ plain: true });
    delete plainUser.password_hash;

    res.status(200).json(plainUser);
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    if (!req.auth || !req.auth.id_usuario) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const { primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, telefono, correo } = req.body;
    const user = await Usuarios.findByPk(req.auth.id_usuario);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (correo && correo !== user.correo) {
      const existingUser = await Usuarios.findOne({ where: { correo } });
      if (existingUser) {
        return res.status(400).json({ error: 'El correo electrónico ya está registrado por otro usuario' });
      }
      user.correo = correo;
    }

    if (primer_nombre) user.primer_nombre = primer_nombre;
    if (segundo_nombre !== undefined) user.segundo_nombre = segundo_nombre;
    if (primer_apellido) user.primer_apellido = primer_apellido;
    if (segundo_apellido !== undefined) user.segundo_apellido = segundo_apellido;
    if (telefono !== undefined) user.telefono = telefono;

    await user.save();

    const userWithRole = await Usuarios.findByPk(user.id_usuario, {
      include: [{ model: Roles, as: 'rolRel' }]
    });

    const plainUser = userWithRole.get({ plain: true });
    delete plainUser.password_hash;

    res.status(200).json({
      message: 'Perfil actualizado exitosamente',
      user: plainUser
    });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    if (!req.auth || !req.auth.id_usuario) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const { currentPassword, newPassword } = req.body;
    const user = await Usuarios.findByPk(req.auth.id_usuario);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const isValidPassword = await verifyPassword(currentPassword, user.password_hash);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'La contraseña actual es incorrecta' });
    }

    const new_password_hash = await hashPassword(newPassword);
    await user.update({ password_hash: new_password_hash });

    res.status(200).json({ message: 'Contraseña cambiada exitosamente' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  verifyToken,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  changePassword,
};
