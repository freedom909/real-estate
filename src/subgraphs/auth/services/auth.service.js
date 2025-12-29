import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
/**
 * ⚠️ 真实项目中：
 * - user 应来自 user-subgraph / user-service
 * - 这里只是 mock，方便你先跑通
 */
const mockUsers = [
  {
    id: "a1",
    email: "agent@test.com",
    role: "AGENT",
  },
];

class AuthService {
  constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
    console.log("JWT_SECRET =", process.env.JWT_SECRET);
    this.ACCESS_TOKEN_EXPIRES_IN = "15m";
  }

  /**
   * OAuth / Email 登录统一入口
   */
  async login({ provider, payload }) {
    // 1️⃣ 验证第三方 or email（此处简化）
    const user = await this.validateUser(provider, payload);

    if (!user) {
      throw new Error("Invalid credentials");
    }

    // 2️⃣ 生成 token
    const accessToken = this.generateAccessToken(user);

    // 3️⃣ 返回 AuthPayload
    return {
      user,
      accessToken,
    };
  }

  /**
   * 校验 token（给 gateway / auth resolver 用）
   */
  verifyToken(token) {
    try {
       console.log("JWT_SECRET =", process.env.JWT_SECRET);
      return jwt.verify(token, this.JWT_SECRET);
    } catch (err) {
      return null;
    }
  }

  /**
   * ===== 内部方法 =====
   */

  async validateUser(provider, payload) {
    // 示例：email 登录
    if (provider === "email") {
      return mockUsers.find(
        (u) => u.email === payload.email
      );
    }

    // 示例：OAuth（Google / Apple）
    if (provider === "google") {
      return mockUsers[0];
    }

    return null;
  }

  generateAccessToken(user) {
    return jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      this.JWT_SECRET,
      {
        expiresIn: this.ACCESS_TOKEN_EXPIRES_IN,
      }
    );
  }
}

export default AuthService;