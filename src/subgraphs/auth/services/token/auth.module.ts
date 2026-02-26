// bootstrap.ts 或 auth.module.ts

import { SignOptions } from "jsonwebtoken";
import { EnvKeyProvider } from "./env-key.provider";
import TokenService from "./token.service";

const keyProvider = new EnvKeyProvider();

export const tokenService = new TokenService(keyProvider, {
  issuer: process.env.JWT_ISSUER,
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"],
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"],
});