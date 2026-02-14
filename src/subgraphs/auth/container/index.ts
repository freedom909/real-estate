// src/subgraphs/auth/container/index.ts
import { createAuthContainer } from "./auth.container.js";


interface Request {
  userApi?: any;
  refreshTokenRepo?: any;
  [key: string]: any;
}

interface Context {
  container: any;
  req: Request;
}

export function buildAuthContext({ req }: { req: Request }): Context {
  const container = createAuthContainer({
    userApi: req.userApi,   // Use default infra if not injected
    refreshTokenRepo: req.refreshTokenRepo,
    redis: req.redis, // ContainerParams に必須なため追加
  });

  return {
    container,
    req,
  };
}