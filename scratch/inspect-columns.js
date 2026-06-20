const { sequelize } = require('../src/models');

async function inspect() {
  try {
    await sequelize.authenticate();
    const [results] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'usuarios'
    `);
    console.log('Columns of usuarios:', results);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await sequelize.close();
  }
}

inspect();
