// env-key.provider.ts

import { KeyProvider } from "./token.service";
import fs from "fs";
export class EnvKeyProvider implements KeyProvider {

  getPrivateKey(): string {
    if (!process.env.JWT_PRIVATE_KEY_PATH) {
      throw new Error("Missing JWT_PRIVATE_KEY");
    }
　　 const privateKey=fs.readFileSync( process.env.JWT_PRIVATE_KEY_PATH,"utf8")
    return privateKey.replace(/\\n/g, "\n");
  }

  getPublicKey(): string {
    if (!process.env.JWT_PUBLIC_KEY_PATH) {
      throw new Error("Missing JWT_PUBLIC_KEY");
    }
    const publicKey=fs.readFileSync( process.env.JWT_PUBLIC_KEY_PATH,"utf8")
    
    return publicKey.replace(/\\n/g, "\n");
  }
}