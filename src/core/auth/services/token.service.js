//src/core/auth/services/token.service.js
import jwt from "jsonwebtoken";
import crypto from "crypto";
import fs from "fs";

const PRIVATE_KEY = fs.readFileSync(process.env.JWT_PRIVATE_KEY_PATH);
const PUBLIC_KEY = fs.readFileSync(process.env.JWT_PUBLIC_KEY_PATH);

export default class TokenService {
  signAccessToken(payload) {
    return jwt.sign(payload, PRIVATE_KEY, {
      algorithm: "RS256",
      expiresIn: "15m",
    });
  }

  verifyAccessToken(token) {
    return jwt.verify(token, PUBLIC_KEY, {
      algorithms: ["RS256"],
    });
  }

  generateRefreshToken() {
    return crypto.randomBytes(64).toString("hex");
  }

  hashRefreshToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
  }
}