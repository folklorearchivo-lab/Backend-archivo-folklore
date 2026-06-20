const factory = (sequelize, DataTypes) => {
  const Manifestaciones = sequelize.define('Manifestaciones', {
    id_manifestacion: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_tipo_folklore: {
      type: DataTypes.INTEGER,
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
    origen_historico: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    vigencia_actual: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    observaciones: {
      type: DataTypes.TEXT,
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
    fecha_registro: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'manifestaciones_folklore',
    timestamps: false,
  });

  return Manifestaciones;
};

factory.tableName = 'manifestaciones_folklore';
factory.idColumns = ["id_manifestacion"];

module.exports = factory;
