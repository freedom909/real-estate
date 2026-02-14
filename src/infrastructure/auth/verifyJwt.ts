import jwt from "jsonwebtoken";

interface JwtPayload {
  [key: string]: any;
}

function verifyJwt(token: string): JwtPayload {
  return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
}

export default verifyJwt;