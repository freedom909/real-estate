// src/subgraphs/auth/container/index.js
import { createAuthContainer } from "./auth.container.js";

export function buildAuthContext({ req }) {
  const container = createAuthContainer({
    userApi: req.userApi,               // 或从 gateway 注入
    refreshTokenRepo: req.refreshTokenRepo,
  });

  return {
    container,
    req,
  };
}
