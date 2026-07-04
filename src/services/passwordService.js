const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;
const MAX_HISTORIAL = 5;

async function hashPassword(password) {
  if (!password || typeof password !== 'string') {
    throw new Error('La contraseña debe ser una cadena de texto válida');
  }
  return await bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password, storedHash) {
  if (!password || !storedHash) {
    return false;
  }
  return await bcrypt.compare(password, storedHash);
}

// Revisa si `password` coincide con el hash actual o con alguno de los últimos
// MAX_HISTORIAL hashes usados por el usuario, para impedir su reutilización.
async function passwordFueUsadaAntes(password, hashActual, historial = []) {
  const hashesAVerificar = [hashActual, ...(historial || [])].filter(Boolean);
  for (const hash of hashesAVerificar) {
    if (await bcrypt.compare(password, hash)) {
      return true;
    }
  }
  return false;
}

// Antepone el hash actual al historial y lo recorta a MAX_HISTORIAL entradas.
function agregarAlHistorial(historial = [], hashActual) {
  if (!hashActual) return historial || [];
  return [hashActual, ...(historial || [])].slice(0, MAX_HISTORIAL);
}

module.exports = {
  hashPassword,
  verifyPassword,
  passwordFueUsadaAntes,
  agregarAlHistorial,
};
