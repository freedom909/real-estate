// src/shared/debug.js

const isAuthDebug = process.env.DEBUG_AUTH === "true";
const isTokenDebug = process.env.DEBUG_TOKEN === "true";
const isRiskDebug = process.env.DEBUG_RISK === "true";

function log(tag, message, data) {
  console.log(
    `[${tag}] ${message}`,
    data ? JSON.stringify(data, null, 2) : ""
  );
}

export function debugAuth(message, data) {
  if (!isAuthDebug) return;
  log("AUTH", message, data);
}

export function debugToken(message, data) {
  if (!isTokenDebug) return;
  log("TOKEN", message, data);
}

export function debugRisk(message, data) {
  if (!isRiskDebug) return;
  log("RISK", message, data);
}
