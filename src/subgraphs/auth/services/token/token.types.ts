// token.types.ts

export interface JwtKeyPair {
  privateKey: string;
  publicKey: string;
}

export interface KeyProvider {
  getKeys(): JwtKeyPair;
}