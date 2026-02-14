import crypto from "crypto";
export function generateCsrfToken() {
    return crypto.randomBytes(32).toString("hex");
}
export function verifyCsrf(req) {
    const cookieToken = req.cookies?.csrf_token;
    const headerToken = req.headers["x-csrf-token"];
    if (!cookieToken || cookieToken !== headerToken) {
        throw new Error("CSRF validation failed");
    }
}
