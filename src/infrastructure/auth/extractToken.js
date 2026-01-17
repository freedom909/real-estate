function extractToken(req) {
  const auth = req.headers.authorization;
  if (!auth) return null;
  if (auth.startsWith("Bearer ")) {
    return auth.slice(7);
  }
  return null;
}

export default extractToken;