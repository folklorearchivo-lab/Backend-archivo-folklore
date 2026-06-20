const jwt = require('jsonwebtoken');
const config = require('../config/env');

const DEFAULT_EXPIRES_IN = config.jwt.expiresIn || '24h';

function signAccessToken(payload, options = {}) {
  const expiresIn = options.expiresIn || DEFAULT_EXPIRES_IN;
  return jwt.sign(payload, config.jwt.secret, { expiresIn });
}

function verifyAccessToken(token) {
  return jwt.verify(token, config.jwt.secret);
}

function extractBearerToken(authorizationHeader) {
  if (!authorizationHeader || typeof authorizationHeader !== 'string') {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return null;
  }

  return token;
}

module.exports = {
  signAccessToken,
  verifyAccessToken,
  extractBearerToken,
};
