const { sequelize, Usuarios, Roles } = require('../src/models');

async function check() {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB!');
    const roles = await Roles.findAll({ raw: true });
    console.log('Roles:', roles);
    const users = await Usuarios.findAll({
      include: [{ model: Roles, as: 'rolRel' }],
      raw: false
    });
    console.log('Users count:', users.length);
    for (const u of users) {
      console.log(`User: id=${u.id_usuario}, email=${u.correo}, role=${u.rolRel ? u.rolRel.nombre_rol : 'none'}, primer_nombre=${u.primer_nombre}, password_hash=${u.password_hash}`);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await sequelize.close();
  }
}

check();
