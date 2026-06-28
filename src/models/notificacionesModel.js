const factory = (sequelize, DataTypes) => {
  const Notificaciones = sequelize.define('Notificaciones', {
    id_notificacion: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    titulo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mensaje: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    tipo: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'info',
    },
    leida: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'notificaciones',
    timestamps: false,
  });

  return Notificaciones;
};

factory.tableName = 'notificaciones';
factory.idColumns = ["id_notificacion"];

module.exports = factory;
