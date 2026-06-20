const app = require('./app');
const config = require('./config/env');
const { testConnection, sequelize } = require('./config/database');

const port = config.port || 3000;

async function startServer() {
  // 1. Validar la conexión a la base de datos
  const dbConnected = await testConnection();
  if (!dbConnected) {
    process.exit(1);
  }

  try {
    // 2. Sincronizar modelos silenciosamente
    await sequelize.sync();
  } catch (err) {
    console.error('❌ Database sync error:', err.message);
  }

  // 3. Iniciar la escucha del servidor de Express
  const server = app.listen(port, () => {
    console.log(`🚀 Server listening on port ${port}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Error: Port ${port} is already in use by another process.`);
      process.exit(1);
    } else {
      console.error('❌ Error starting server:', err.message);
      process.exit(1);
    }
  });
}

startServer();
