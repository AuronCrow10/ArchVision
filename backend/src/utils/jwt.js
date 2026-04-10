import jwt from 'jsonwebtoken';

const ACCESS_EXPIRES  = '15m';
const REFRESH_EXPIRES = '7d';

export function signAccess(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: ACCESS_EXPIRES });
}

export function signRefresh(payload) {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES });
}

export function verifyAccess(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

export function verifyRefresh(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}

/** Returns Date object for refresh token DB expiry */
export function refreshExpiresAt() {
  return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
}
