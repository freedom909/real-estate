// src/test/helpers/createTestContainer.js
import createContainer from "../../../src/shared/container/createContainer.js";
import { TOKENS } from "../../../src/shared/container/tokens.js";
import TokenService from "../../../src/subgraphs/auth/services/token/token.service.js";
import RefreshTokenService from "../../../src/subgraphs/auth/services/refresh/refreshToken.service.js";

/**
 * In-memory fake repos (E2E-safe)
 */
class InMemoryRefreshTokenRepo {
  tokens = new Set();

  async save(token) {
    this.tokens.add(token);
  }

  async consume(token) {
    if (!this.tokens.has(token)) return false;
    this.tokens.delete(token);
    return true;
  }

  async revokeBySession(sessionId) {
    for (const [token, sid] of this.tokens.entries()) {
      if (sid === sessionId) {
        this.tokens.delete(token);
      }
    }
  }

  async revokeFamily() {}
  async revokeAllByUser() {}
}

class InMemoryUserRepo {
  async getTokenVersion() {
    return 0;
  }
}

class InMemoryRiskService {
  async handleRefreshTokenReuse() {}
}

export function createTestContainer() {
  const container = createContainer();

  container.register(
    TOKENS.auth.tokenService,
    () => new TokenService()
  );

  container.register(
    TOKENS.auth.refreshTokenRepo,
    () => new InMemoryRefreshTokenRepo()
  );

  container.register(
    TOKENS.auth.loginRiskService,
    () => new InMemoryRiskService()
  );

  container.register(
    TOKENS.auth.userRepo,
    () => new InMemoryUserRepo()
  );

  container.register(
    TOKENS.auth.refreshTokenService,
    () =>
      new RefreshTokenService({
        tokenService: container.resolve(TOKENS.auth.tokenService),
        refreshTokenRepo: container.resolve(TOKENS.auth.refreshTokenRepo),
        loginRiskService: container.resolve(TOKENS.auth.loginRiskService),
        userRepo: container.resolve(TOKENS.auth.userRepo),
      })
  );

  return container;
}
