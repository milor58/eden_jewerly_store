/* © 2026 Eden Jewelry. All rights reserved. */
import jwt from 'jsonwebtoken';

export function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
}

// Throws if the token is missing, forged or expired.
export function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}
