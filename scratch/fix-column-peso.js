const { sequelize } = require('../src/models');

async function fix() {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB. Removing default constraint from obras.peso...');
    await sequelize.query(`
      ALTER TABLE obras ALTER COLUMN peso DROP DEFAULT
    `).catch(err => console.log('No default constraint found or error dropping it, proceeding...'));

    console.log('Altering obras.peso column type to numeric...');
    await sequelize.query(`
      ALTER TABLE obras 
      ALTER COLUMN peso TYPE numeric(10, 2) 
      USING (NULLIF(regexp_replace(peso, '[^0-9.]', '', 'g'), '')::numeric(10, 2))
    `);
    console.log('✅ Column peso successfully altered to numeric!');
  } catch (err) {
    console.error('❌ Error altering column:', err);
  } finally {
    await sequelize.close();
  }
}

fix();
