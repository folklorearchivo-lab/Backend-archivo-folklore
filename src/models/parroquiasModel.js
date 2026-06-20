const factory = (sequelize, DataTypes) => {
  const Parroquias = sequelize.define('Parroquias', {
    id_parroquia: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_municipio: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: 'parroquias',
    timestamps: false,
  });

  return Parroquias;
};

factory.tableName = 'parroquias';
factory.idColumns = ["id_parroquia"];

module.exports = factory;
