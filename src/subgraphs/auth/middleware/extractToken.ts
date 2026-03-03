// src/middleware/extractToken.ts
// 从请求头中提取 Bearer 令牌
import { Request } from "express";

export function extractToken(req: Request): string {
  const auth = req.headers.authorization;

  if (!auth) {
    throw new Error("NO_TOKEN");
  }

  if (!auth.startsWith("Bearer ")) {
    throw new Error("INVALID_TOKEN_FORMAT");
  }

  return auth.substring(7);
}

// import { Request, Response, NextFunction } from "express";

// export function extractToken(
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) {
//   const auth = req.headers.authorization;

//   if (!auth || !auth.startsWith("Bearer ")) {
//     return res.status(401).json({ message: "Unauthorized" });
//   }

//   req.token = auth.substring(7);

//   next();
// }