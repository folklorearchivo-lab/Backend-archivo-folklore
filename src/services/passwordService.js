const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

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

module.exports = {
  hashPassword,
  verifyPassword,
};
