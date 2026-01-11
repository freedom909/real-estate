// src/subgraphs/auth/container/index.js
import { createAuthContainer } from "./auth.container.js";
import userApi from "../../../infrastructure/userApi.js";

export function buildAuthContext({ req }) {
  const container = createAuthContainer({
    userApi: req.userApi || userApi,    // Use default infra if not injected
    refreshTokenRepo: req.refreshTokenRepo,
  });

  return {
    container,
    req,
  };
}
