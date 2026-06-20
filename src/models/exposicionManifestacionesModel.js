const factory = (sequelize, DataTypes) => {
  const ExposicionManifestaciones = sequelize.define('ExposicionManifestaciones', {
    id_exposicion: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    id_manifestacion: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    sala: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    orden_display: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: 'exposicion_manifestaciones',
    timestamps: false,
  });

  return ExposicionManifestaciones;
};

factory.tableName = 'exposicion_manifestaciones';
factory.idColumns = ["id_exposicion","id_manifestacion"];

module.exports = factory;
