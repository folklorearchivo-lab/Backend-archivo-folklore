const factory = (sequelize, DataTypes) => {
  const Exposiciones = sequelize.define('Exposiciones', {
    id_exposicion: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre_exposicion: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    lugar_fisico: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    id_parroquia: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    fecha_inicio: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    fecha_fin: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    organizador: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    es_virtual: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    url_galeria_virtual: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    estatus: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    id_usuario_registro: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  }, {
    tableName: 'exposiciones',
    timestamps: false,
  });

  return Exposiciones;
};

factory.tableName = 'exposiciones';
factory.idColumns = ["id_exposicion"];

module.exports = factory;
