const factory = (sequelize, DataTypes) => {
  const Multimedia = sequelize.define('Multimedia', {
    id_multimedia: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tipo_archivo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    url_archivo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nombre_archivo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    id_obra: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_cultor: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_manifestacion: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    es_portada: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fecha_carga: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    id_usuario_carga: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  }, {
    tableName: 'multimedia',
    timestamps: false,
  });

  return Multimedia;
};

factory.tableName = 'multimedia';
factory.idColumns = ["id_multimedia"];

module.exports = factory;
