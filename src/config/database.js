const { Sequelize } = require('sequelize');
const config = require('./env');

const connectionOptions = {
  dialect: 'postgres',
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};

// Agregar SSL si está habilitado o si se conecta a Neon/Supabase
const needSsl = config.db.ssl || (config.db.host && config.db.host.includes('neon.tech')) || (config.db.url && config.db.url.includes('sslmode=require'));
if (needSsl) {
  connectionOptions.dialectOptions = {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  };
}

let sequelize;

if (config.db.url) {
  let dbUrl = config.db.url;
  if (dbUrl.includes('sslmode=require')) {
    dbUrl = dbUrl.replace('sslmode=require', 'sslmode=verify-full');
  }
  sequelize = new Sequelize(dbUrl, connectionOptions);
} else {
  sequelize = new Sequelize(
    config.db.name,
    config.db.user,
    config.db.password,
    {
      host: config.db.host,
      port: config.db.port,
      ...connectionOptions
    }
  );
}

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');
    return true;
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    return false;
  }
}

module.exports = {
  sequelize,
  Sequelize,
  testConnection,
};
