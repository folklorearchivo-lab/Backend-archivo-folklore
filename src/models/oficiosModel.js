const factory = (sequelize, DataTypes) => {
  const Oficios = sequelize.define('Oficios', {
    id_oficio: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'oficios',
    timestamps: false,
  });

  return Oficios;
};

factory.tableName = 'oficios';
factory.idColumns = ["id_oficio"];

module.exports = factory;
