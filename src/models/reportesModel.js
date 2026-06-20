const factory = (sequelize, DataTypes) => {
  const Reportes = sequelize.define('Reportes', {
    id_reporte: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    titulo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tipo_reporte: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    parametros_filtro: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    url_archivo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    id_usuario_genera: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    fecha_generacion: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'reportes',
    timestamps: false,
  });

  return Reportes;
};

factory.tableName = 'reportes';
factory.idColumns = ["id_reporte"];

module.exports = factory;
