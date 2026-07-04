// 1) Añade la columna `password_temporal` a `usuarios`.
// 2) Reemplaza el UNIQUE(correo) por UNIQUE(correo, id_rol), para permitir que la
//    misma persona tenga cuenta de administrador y de cultor con el mismo correo.
// Ejecutar: node scratch/add-password-temporal-and-fix-correo-unique.js
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
      ADD COLUMN IF NOT EXISTS password_temporal BOOLEAN NOT NULL DEFAULT false;
    `);
    console.log('Columna "password_temporal" añadida correctamente a la tabla usuarios.');

    // Busca y elimina cualquier constraint UNIQUE que cubra únicamente la columna
    // "correo" (sin importar el nombre que Postgres le haya dado al crearla).
    const [constraints] = await sequelize.query(`
      SELECT tc.constraint_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name AND tc.table_name = kcu.table_name
      WHERE tc.table_name = 'usuarios' AND tc.constraint_type = 'UNIQUE'
      GROUP BY tc.constraint_name
      HAVING array_agg(kcu.column_name::text) = ARRAY['correo']::text[];
    `);

    for (const { constraint_name } of constraints) {
      await sequelize.query(`ALTER TABLE usuarios DROP CONSTRAINT "${constraint_name}";`);
      console.log(`Constraint UNIQUE(correo) "${constraint_name}" eliminado.`);
    }

    await sequelize.query(`
      ALTER TABLE usuarios
      ADD CONSTRAINT usuarios_correo_id_rol_unique UNIQUE (correo, id_rol);
    `);
    console.log('Constraint UNIQUE(correo, id_rol) creado correctamente.');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await sequelize.close();
  }
}

main();