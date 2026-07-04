// Añade la columna `correo_actualizado_en` a `usuarios`, usada para limitar el
// cambio de correo a una vez por mes (ver updateProfile en authController.js).
// Ejecutar: node scratch/add-column-correo-actualizado-en.js
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
      ALTER TABLE usuarios
      ADD COLUMN IF NOT EXISTS correo_actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NULL;
    `);

    console.log('Columna "correo_actualizado_en" añadida correctamente a la tabla usuarios.');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await sequelize.close();
  }
}

main();