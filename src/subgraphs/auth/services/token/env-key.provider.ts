// env-key.provider.ts

import fs from "fs";
import { KeyProvider, JwtKeyPair } from "./token.types";

export class EnvKeyProvider implements KeyProvider {
  getKeys(): JwtKeyPair {
    const privateKey = process.env.JWT_PRIVATE_KEY;
    const publicKey = process.env.JWT_PUBLIC_KEY;

    const privateKeyPath = process.env.JWT_PRIVATE_KEY_PATH;
    const publicKeyPath = process.env.JWT_PUBLIC_KEY_PATH;

    // 优先使用 ENV 内容
    if (privateKey && publicKey) {
      return {
        privateKey: privateKey.replace(/\\n/g, "\n"),
        publicKey: publicKey.replace(/\\n/g, "\n"),
      };
    }

    // 次选文件路径
    if (privateKeyPath && publicKeyPath) {
      return {
        privateKey: fs.readFileSync(privateKeyPath, "utf8"),
        publicKey: fs.readFileSync(publicKeyPath, "utf8"),
      };
    }

    throw new Error("JWT keys not configured");
  }
}