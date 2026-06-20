const factory = (sequelize, DataTypes) => {
  const CultorManifestaciones = sequelize.define('CultorManifestaciones', {
    id_cultor: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    id_manifestacion: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    rol_en_manifestacion: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: 'cultor_manifestaciones',
    timestamps: false,
  });

  return CultorManifestaciones;
};

factory.tableName = 'cultor_manifestaciones';
factory.idColumns = ["id_cultor","id_manifestacion"];

module.exports = factory;
