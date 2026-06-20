const { sequelize } = require('../src/models');

async function fix() {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB. Removing default constraint from cultores.esta_certificado...');
    await sequelize.query(`
      ALTER TABLE cultores ALTER COLUMN esta_certificado DROP DEFAULT
    `).catch(err => console.log('No default constraint found or error dropping it, proceeding...'));

    console.log('Altering cultores.esta_certificado column type...');
    await sequelize.query(`
      ALTER TABLE cultores 
      ALTER COLUMN esta_certificado TYPE boolean 
      USING (CASE WHEN esta_certificado::text = '1' OR esta_certificado::text = 'true' OR esta_certificado::text = 'si' OR esta_certificado::text = 'sí' THEN true ELSE false END)
    `);
    console.log('✅ Column esta_certificado successfully altered!');
  } catch (err) {
    console.error('❌ Error altering column:', err);
  } finally {
    await sequelize.close();
  }
}

fix();
