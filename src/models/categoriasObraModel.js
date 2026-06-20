const factory = (sequelize, DataTypes) => {
  const CategoriasObra = sequelize.define('CategoriasObra', {
    id_categoria: {
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
    tableName: 'categorias_obra',
    timestamps: false,
  });

  return CategoriasObra;
};

factory.tableName = 'categorias_obra';
factory.idColumns = ["id_categoria"];

module.exports = factory;
