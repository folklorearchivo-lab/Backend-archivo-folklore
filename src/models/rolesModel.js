const factory = (sequelize, DataTypes) => {
  const Roles = sequelize.define('Roles', {
    id_rol: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre_rol: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    descripcion: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: 'roles',
    timestamps: false,
  });

  return Roles;
};

factory.tableName = 'roles';
factory.idColumns = ["id_rol"];

module.exports = factory;
