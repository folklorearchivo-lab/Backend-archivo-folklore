const factory = (sequelize, DataTypes) => {
  const Municipios = sequelize.define('Municipios', {
    id_municipio: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    codigo_postal: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: 'municipios',
    timestamps: false,
  });

  return Municipios;
};

factory.tableName = 'municipios';
factory.idColumns = ["id_municipio"];

module.exports = factory;
