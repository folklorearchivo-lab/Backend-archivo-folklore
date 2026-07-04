const factory = (sequelize, DataTypes) => {
  const Usuarios = sequelize.define('Usuarios', {
    id_usuario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    primer_nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    segundo_nombre: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    primer_apellido: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    segundo_apellido: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    correo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // true mientras la contraseña fue generada por el sistema (creación de usuario,
    // aprobación de cultor) y el dueño de la cuenta aún no la ha cambiado por una propia.
    password_temporal: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    id_rol: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    telefono: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    fecha_registro: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    ultimo_acceso: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    reset_password_token: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reset_password_expires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // Fecha del último cambio de correo. Se usa para limitar el cambio a una vez por
    // mes (ver updateProfile en authController.js). null = nunca lo ha cambiado.
    correo_actualizado_en: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // Hashes de las últimas contraseñas usadas (más reciente primero), para impedir
    // que el usuario reutilice una contraseña anterior (ver passwordService.js).
    historial_passwords: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
  }, {
    tableName: 'usuarios',
    timestamps: false,
    // Único por (correo, id_rol) y no por correo solo: permite que la misma persona
    // tenga cuenta de administrador y de cultor con el mismo correo electrónico.
    indexes: [
      { unique: true, fields: ['correo', 'id_rol'], name: 'usuarios_correo_id_rol_unique' },
    ],
  });

  return Usuarios;
};

factory.tableName = 'usuarios';
factory.idColumns = ["id_usuario"];

module.exports = factory;
