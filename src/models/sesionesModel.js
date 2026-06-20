const factory = (sequelize, DataTypes) => {
  const Sesiones = sequelize.define('Sesiones', {
    id_sesion: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    token_hash: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ip_acceso: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fecha_inicio: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    fecha_expira: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    activa: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: 'sesiones',
    timestamps: false,
  });

  return Sesiones;
};

factory.tableName = 'sesiones';
factory.idColumns = ["id_sesion"];

module.exports = factory;
