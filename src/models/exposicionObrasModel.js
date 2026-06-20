const factory = (sequelize, DataTypes) => {
  const ExposicionObras = sequelize.define('ExposicionObras', {
    id_exposicion: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    id_obra: {
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
    tableName: 'exposicion_obras',
    timestamps: false,
  });

  return ExposicionObras;
};

factory.tableName = 'exposicion_obras';
factory.idColumns = ["id_exposicion","id_obra"];

module.exports = factory;
