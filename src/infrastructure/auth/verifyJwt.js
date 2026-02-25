// src/infrastructure/auth/verifyJwt.js
import jwt from "jsonwebtoken";
import fs from "fs";

  const privateKeyPath = process.env.JWT_PRIVATE_KEY;
  const publicKeyPath = process.env.JWT_PUBLIC_KEY;

  if (!privateKeyPath || !publicKeyPath) {
    throw new Error("JWT key paths not configured");
  }

  this.refreshPrivateKey = fs.readFileSync(privateKeyPath, "utf8");
  this.refreshPublicKey = fs.readFileSync(publicKeyPath, "utf8");

function verifyJwt(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

export default verifyJwt;