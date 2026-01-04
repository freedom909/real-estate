// src/subgraphs/auth/services/token/token.service.js
import jwt from "jsonwebtoken";

class TokenService {
  constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
    this.ACCESS_EXPIRES_IN = "15m";
    this.REFRESH_EXPIRES_IN = "30d";
  }

  issueAccessToken(user) {
    return jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      this.JWT_SECRET,
      {
        expiresIn: this.ACCESS_EXPIRES_IN,
      }
    );
  }

  issueRefreshToken(user) {
    return jwt.sign(
      {
        userId: user.id,
        type: "refresh",
      },
      this.JWT_SECRET,
      {
        expiresIn: this.REFRESH_EXPIRES_IN,
      }
    );
  }

  verify(token) {
    return jwt.verify(token, this.JWT_SECRET);
  }
}

export default TokenService;
