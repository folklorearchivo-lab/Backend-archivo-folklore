const { Roles, Usuarios, Municipios, Parroquias, Tipos } = require('../models');
const { hashPassword } = require('../services/passwordService');

async function runSeed() {
  try {
    console.log('🌱 Ejecutando siembra (Seed) de datos iniciales...');

    // 0. Crear roles por defecto
    const defaultRoles = ['administrador', 'colaborador', 'usuario'];
    for (const r of defaultRoles) {
      const existingRol = await Roles.findOne({ where: { nombre_rol: r } });
      if (!existingRol) {
        await Roles.create({ nombre_rol: r, descripcion: `Rol de ${r}` });
      }
    }
    const adminRole = await Roles.findOne({ where: { nombre_rol: 'administrador' } });

    // 1. Crear usuario administrador por defecto
    const adminEmail = 'admin@folklore.com';
    const existingAdmin = await Usuarios.findOne({ where: { correo: adminEmail } });
    if (!existingAdmin) {
      const password_hash = await hashPassword('admin12345');
      await Usuarios.create({
        primer_nombre: 'Administrador',
        segundo_nombre: null,
        primer_apellido: 'General',
        segundo_apellido: null,
        correo: adminEmail,
        password_hash,
        id_rol: adminRole ? adminRole.id_rol : null,
        activo: true,
        fecha_registro: new Date()
      });
      console.log(`✅ Usuario administrador creado por defecto: ${adminEmail} / admin12345`);
    } else {
      const password_hash = await hashPassword('admin12345');
      await existingAdmin.update({
        primer_nombre: 'Administrador',
        primer_apellido: 'General',
        password_hash,
        id_rol: adminRole ? adminRole.id_rol : null
      });
      console.log('ℹ️ El usuario administrador ya existe y fue normalizado a roles y nombres atómicos (contraseña restablecida a admin12345).');
    }

    // 2. Crear municipios iniciales
    const munCount = await Municipios.count();
    let defaultMun;
    if (munCount === 0) {
      defaultMun = await Municipios.create({ nombre: 'Iribarren' });
      await Municipios.create({ nombre: 'Palavecino' });
      await Municipios.create({ nombre: 'Torres' });
      console.log('✅ Municipios iniciales creados.');
    } else {
      defaultMun = await Municipios.findOne();
      console.log('ℹ️ Los municipios ya existen.');
    }

    // 3. Crear parroquias iniciales
    const parCount = await Parroquias.count();
    if (parCount === 0 && defaultMun) {
      await Parroquias.create({
        id_municipio: defaultMun.id_municipio,
        nombre: 'Catedral'
      });
      await Parroquias.create({
        id_municipio: defaultMun.id_municipio,
        nombre: 'Santa Rosa'
      });
      console.log('✅ Parroquias iniciales creadas.');
    } else {
      console.log('ℹ️ Las parroquias ya existen.');
    }

    // 4. Crear tipos de folklore iniciales
    const tipCount = await Tipos.count();
    if (tipCount === 0) {
      await Tipos.create({ nombre_tipo: 'Danza', descripcion: 'Bailes tradicionales y folklóricos' });
      await Tipos.create({ nombre_tipo: 'Música', descripcion: 'Cantos, ritmos e instrumentos folklóricos' });
      await Tipos.create({ nombre_tipo: 'Gastronomía', descripcion: 'Comidas y bebidas típicas' });
      await Tipos.create({ nombre_tipo: 'Artesanía', descripcion: 'Objetos y creaciones manuales tradicionales' });
      console.log('✅ Tipos de folklore iniciales creados.');
    } else {
      console.log('ℹ️ Los tipos de folklore ya existen.');
    }

    console.log('🌱 Siembra completada exitosamente.');
  } catch (error) {
    console.error('❌ Error durante la siembra de base de datos:', error);
  }
}

module.exports = runSeed;
