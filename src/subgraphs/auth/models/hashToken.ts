//src/subgraphs/auth/models/hashToken.ts

import crypto from "crypto";

function hashToken(token: string) {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

export default hashToken;