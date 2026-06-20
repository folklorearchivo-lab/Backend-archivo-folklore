const { sequelize } = require('../src/models');

async function fix() {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB. Removing default constraint...');
    await sequelize.query(`
      ALTER TABLE usuarios ALTER COLUMN activo DROP DEFAULT
    `);
    console.log('Altering column type...');
    await sequelize.query(`
      ALTER TABLE usuarios 
      ALTER COLUMN activo TYPE boolean 
      USING (CASE WHEN activo::text = '1' OR activo::text = 'true' OR activo::text = 'Activo' OR activo::text = 'activo' THEN true ELSE false END)
    `);
    console.log('Setting new default to true...');
    await sequelize.query(`
      ALTER TABLE usuarios ALTER COLUMN activo SET DEFAULT true
    `);
    console.log('✅ Column activo successfully altered and default reset!');
  } catch (err) {
    console.error('❌ Error altering column:', err);
  } finally {
    await sequelize.close();
  }
}

fix();
