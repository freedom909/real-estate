// lib/auth.js
import jwt from 'jsonwebtoken';
import * as cookie from 'cookie'; 


const SECRET = process.env.JWT_SECRET;

export function authenticate(req) {
  const { token } = cookie.parse(req.headers.cookie || '');
  if (!token) throw new Error('No token');

  const decoded = jwt.verify(token, SECRET);
  return decoded;
}
