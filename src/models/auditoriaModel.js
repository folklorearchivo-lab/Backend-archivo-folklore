const factory = (sequelize, DataTypes) => {
  const Auditoria = sequelize.define('Auditoria', {
    id_log: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    accion: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tabla_afectada: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    id_registro: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    datos_anteriores: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    datos_nuevos: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ip_origen: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fecha_hora: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'auditoria',
    timestamps: false,
  });

  return Auditoria;
};

factory.tableName = 'auditoria';
factory.idColumns = ["id_log"];

module.exports = factory;
