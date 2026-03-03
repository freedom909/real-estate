// src/subgraphs/auth/container/index.ts
import  {registerAuthDependencies}  from "./registerAuthDependencies.js";


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
  const container = registerAuthDependencies();

  return {
    container,
    req,
  };
}