const app = require('./app');
const config = require('./config/env');
const { testConnection, sequelize } = require('./config/database');

const port = config.port || 3000;
const DB_RETRY_INTERVAL_MS = 10000;

let retryTimer = null;
let isCheckingConnection = false;
let dbConnected = false;

async function syncDatabase() {
  try {
    await sequelize.sync();
    console.log('✅ Database models synced.');
  } catch (err) {
    console.error('❌ Database sync error:', err.message);
  }
}

async function tryConnectDatabase() {
  if (isCheckingConnection || dbConnected) {
    return;
  }
  isCheckingConnection = true;

  const connected = await testConnection();
  isCheckingConnection = false;

  if (connected) {
    dbConnected = true;
    if (retryTimer) {
      clearInterval(retryTimer);
      retryTimer = null;
    }
    await syncDatabase();
    return;
  }

  if (!retryTimer) {
    console.warn(`⚠️  Sin conexión a la base de datos. Reintentando cada ${DB_RETRY_INTERVAL_MS / 1000}s (verifica si la VPN está activa)...`);
    retryTimer = setInterval(tryConnectDatabase, DB_RETRY_INTERVAL_MS);
  }
}

async function startServer() {
  // 1. Intentar conectar a la base de datos SIN bloquear el arranque del servidor
  await tryConnectDatabase();

  // 2. Iniciar la escucha del servidor de Express de todas formas
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
