const factory = (sequelize, DataTypes) => {
  const Cultores = sequelize.define('Cultores', {
    id_cultor: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    cedula: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    seudonimo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    primer_nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    segundo_nombre: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    primer_apellido: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    segundo_apellido: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fecha_nacimiento: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    genero: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    telefono_contacto: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    correo_contacto: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    direccion_residencia: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    id_parroquia: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    resumen_curricular: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    trayectoria_documentada: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    estatus_vida: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    estatus: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    esta_certificado: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    foto_perfil: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    foto_certificacion: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    datos_censo_adicionales: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    fecha_registro: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    fecha_ultima_actualizacion: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'cultores',
    timestamps: false,
  });

  Cultores.prototype.toJSON = function () {
    const values = this.get({ plain: true });
    if (values.fecha_nacimiento) {
      const d = new Date(values.fecha_nacimiento);
      if (!isNaN(d.getTime())) {
        const y = d.getUTCFullYear();
        const m = String(d.getUTCMonth() + 1).padStart(2, '0');
        const day = String(d.getUTCDate()).padStart(2, '0');
        values.fecha_nacimiento = `${y}-${m}-${day}`;
      }
    }
    return values;
  };

  return Cultores;
};

factory.tableName = 'cultores';
factory.idColumns = ["id_cultor"];

module.exports = factory;
