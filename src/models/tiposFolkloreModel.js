const factory = (sequelize, DataTypes) => {
  const Tipos = sequelize.define('Tipos', {
    id_tipo_folklore: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tipo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    id_parroquia: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  }, {
    tableName: 'tipos_folklore',
    timestamps: false,
  });

  return Tipos;
};

factory.tableName = 'tipos_folklore';
factory.idColumns = ["id_tipo_folklore"];

module.exports = factory;
