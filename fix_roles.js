const { Usuarios, Cultores, Roles } = require('./src/models');
const { sequelize } = require('./src/models');

async function fixRoles() {
  try {
    const rolCultor = await Roles.findOne({ where: sequelize.where(sequelize.fn('lower', sequelize.col('nombre_rol')), 'cultor') });
    
    if (!rolCultor) {
      console.log('No se encontró el rol Cultor');
      process.exit(1);
    }

    const cultores = await Cultores.findAll({
      where: {
        id_usuario: {
          [sequelize.Sequelize.Op.not]: null
        }
      }
    });

    console.log(`Encontrados ${cultores.length} cultores vinculados a usuarios.`);
    
    let updatedCount = 0;
    for (const cultor of cultores) {
      const user = await Usuarios.findByPk(cultor.id_usuario);
      if (user && user.id_rol !== rolCultor.id_rol) {
        await user.update({ id_rol: rolCultor.id_rol });
        updatedCount++;
        console.log(`Actualizado usuario ${user.correo} al rol ${rolCultor.nombre_rol}`);
      }
    }

    console.log(`Se actualizaron ${updatedCount} usuarios exitosamente.`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixRoles();
