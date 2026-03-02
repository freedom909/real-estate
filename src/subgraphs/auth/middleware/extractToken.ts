// src/middleware/extractToken.ts
import {  Request } from "express";

export function extractToken(req: Request) {
  return async (req: Request) => {
    const auth = req.headers.authorization;
      if (!auth) throw new Error("NO_TOKEN");

    const token = auth.replace("Bearer ", "");
    return token;
  };
}