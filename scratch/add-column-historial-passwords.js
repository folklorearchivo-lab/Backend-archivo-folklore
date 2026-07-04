// Añade la columna `historial_passwords` a `usuarios`, usada para impedir que un
// usuario reutilice una contraseña que ya usó antes (ver passwordService.js).
// Ejecutar: node scratch/add-column-historial-passwords.js
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
      ADD COLUMN IF NOT EXISTS historial_passwords JSON NOT NULL DEFAULT '[]';
    `);

    console.log('Columna "historial_passwords" añadida correctamente a la tabla usuarios.');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await sequelize.close();
  }
}

main();
