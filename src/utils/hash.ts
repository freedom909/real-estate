//src/utils/hash.ts


import crypto from "crypto";

export function hash(t: string) {
  return crypto.createHash("sha256").update(t).digest("hex");
}