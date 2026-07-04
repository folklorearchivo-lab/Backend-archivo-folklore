// Crea la tabla `efemerides` (nuevo apartado "Efemérides" de la web pública).
// Ejecutar: node scratch/create-table-efemerides.js
// (Requiere la misma configuración de BD que el backend principal).

const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

async function main() {
  const DATABASE_URL = process.env.DATABASE_URL || (
    `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
  );
  if (!DATABASE_URL || DATABASE_URL === 'postgresql://undefined:undefined@undefined:undefined/undefined') {
    console.error('Falta DATABASE_URL o las variables DB_* en .env');
    process.exit(1);
  }

  const sequelize = new Sequelize(DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: DATABASE_URL.includes('localhost') ? false : { require: true, rejectUnauthorized: false },
    },
  });

  try {
    await sequelize.authenticate();
    console.log('Conectado a la BD');

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS efemerides (
        id_efemeride SERIAL PRIMARY KEY,
        titulo VARCHAR(150) NOT NULL,
        descripcion TEXT,
        dia INTEGER NOT NULL,
        mes INTEGER NOT NULL,
        anio_referencia INTEGER,
        categoria VARCHAR(50),
        imagen VARCHAR(2048),
        activa BOOLEAN NOT NULL DEFAULT true,
        id_usuario_registro INTEGER REFERENCES usuarios(id_usuario),
        fecha_registro TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('Tabla "efemerides" creada correctamente (o ya existía).');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await sequelize.close();
  }
}

main();
