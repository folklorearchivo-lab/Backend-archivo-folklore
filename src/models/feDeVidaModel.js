const factory = (sequelize, DataTypes) => {
  const FeDeVida = sequelize.define('FeDeVida', {
    id_fe_vida: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_cultor: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    fecha_control: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    estatus_confirmado: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    metodo_verificacion: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    id_usuario_registro: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  }, {
    tableName: 'fe_de_vida',
    timestamps: false,
  });

  return FeDeVida;
};

factory.tableName = 'fe_de_vida';
factory.idColumns = ["id_fe_vida"];

module.exports = factory;
