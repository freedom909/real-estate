// utils/parseCookies.js
import { parse } from "cookie";

export function parseCookies(req) {
  return parse(req?.headers?.cookie || "");
}
