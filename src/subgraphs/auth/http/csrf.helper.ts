import crypto from "crypto";

interface Request {
  cookies?: {
    [key: string]: string;
  };
  headers: {
    [key: string]: string | string[] | undefined;
  };
}

export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function verifyCsrf(req: Request): void {
  const cookieToken = req.cookies?.csrf_token;
  const headerToken = req.headers["x-csrf-token"];

  if (!cookieToken || cookieToken !== headerToken) {
    throw new Error("CSRF validation failed");
  }
}