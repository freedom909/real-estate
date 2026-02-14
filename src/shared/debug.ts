// src/shared/debug.ts

const isAuthDebug = process.env.DEBUG_AUTH === "true";
const isTokenDebug = process.env.DEBUG_TOKEN === "true";
const isRiskDebug = process.env.DEBUG_RISK === "true";

function log(tag: string, message: string, data?: any): void {
  console.log(
    `[${tag}] ${message}`,
    data ? JSON.stringify(data, null, 2) : ""
  );
}

export function debugAuth(message: string, data?: any): void {
  if (!isAuthDebug) return;
  log("AUTH", message, data);
}

export function debugToken(message: string, data?: any): void {
  if (!isTokenDebug) return;
  log("TOKEN", message, data);
}

export function debugRisk(message: string, data?: any): void {
  if (!isRiskDebug) return;
  log("RISK", message, data);
}