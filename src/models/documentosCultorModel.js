const factory = (sequelize, DataTypes) => {
  const DocumentosCultor = sequelize.define('DocumentosCultor', {
    id_documento: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_cultor: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    tipo_documento: {
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
    fecha_carga: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    id_usuario_carga: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  }, {
    tableName: 'documentos_cultor',
    timestamps: false,
  });

  return DocumentosCultor;
};

factory.tableName = 'documentos_cultor';
factory.idColumns = ["id_documento"];

module.exports = factory;
