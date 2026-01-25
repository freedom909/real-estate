export const securityContextMiddleware = (req, res, next) => {
  req.securityContext={
    ip:req.ip,
    userAgent:req.headers['user-agent'],
    requrestStart:Date.now(),
  };
  next();
};