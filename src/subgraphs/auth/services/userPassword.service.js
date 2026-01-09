// services/userPassword.service.js
import bcrypt from "bcrypt";

const SALT_ROUNDS = 12; // 企业级常用区间 10~12

export async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

