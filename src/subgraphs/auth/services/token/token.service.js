import jwt from "jsonwebtoken";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

const ACCESS_EXPIRES = "1h";
const REFRESH_EXPIRES = "30d";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

function hash(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// const tokenService = {
//   async issue(user, refreshTokenRepo) {
//     const accessToken = jwt.sign(
//       {
//         sub: user.id,
//         role: user.role,
//         email: user.email,
//       },
//       JWT_SECRET,
//       { expiresIn: ACCESS_EXPIRES }
//     );

//     const jti = uuidv4();

//     const refreshToken = jwt.sign(
//       {
//         sub: user.id,
//         jti,
//         type: "refresh",
//       },
//       JWT_REFRESH_SECRET,
//       { expiresIn: REFRESH_EXPIRES }
//     );

//     await refreshTokenRepo.create({
//       id: jti,
//       userId: user.id,
//       hashedToken: hash(refreshToken),
//       expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
//     });

//     return { accessToken, refreshToken };
//   },
//   async rotate(refreshToken, refreshTokenRepo) {
//     let payload;

//     try {
//       payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
//     } catch {
//       throw new Error("Invalid refresh token");
//     }

//     if (payload.type !== "refresh") {
//       throw new Error("Invalid token type");
//     }

//     const stored = await refreshTokenRepo.findById(payload.jti);

//     if (!stored || stored.revokedAt) {
//       throw new Error("Refresh token reused or revoked");
//     }

//     // 防重放：立刻撤销旧 token
//     await refreshTokenRepo.revoke(payload.jti);

//     // token hash 校验（防 DB 泄漏）
//     if (stored.hashedToken !== hash(refreshToken)) {
//       throw new Error("Token mismatch");
//     }

//     // 发新 token（rotation）
//     const user = await userRepo.findById(payload.sub);

//     return this.issue(user, refreshTokenRepo);
//   },
// };

// export default tokenService;



export default class TokenService {
  issue(user) {
    return {
      accessToken: this.signAccessToken({
        sub: user.id,
        role: user.role,
        email: user.email,
      }),
      refreshToken: this.generateRefreshToken(),
    };
  }

  signAccessToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });
  }

  generateRefreshToken() {
    return crypto.randomUUID();
  }

  hashRefreshToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
  }
}
