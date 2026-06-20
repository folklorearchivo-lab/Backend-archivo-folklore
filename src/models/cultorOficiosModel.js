const factory = (sequelize, DataTypes) => {
  const CultorOficios = sequelize.define('CultorOficios', {
    id_cultor: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    id_oficio: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    es_principal: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: 'cultor_oficios',
    timestamps: false,
  });

  return CultorOficios;
};

factory.tableName = 'cultor_oficios';
factory.idColumns = ["id_cultor","id_oficio"];

module.exports = factory;
