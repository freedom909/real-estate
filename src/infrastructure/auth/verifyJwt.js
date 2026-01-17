function verifyJwt(token) {
  return jwt.verify(token, JWT_SECRET);
}

export default verifyJwt;