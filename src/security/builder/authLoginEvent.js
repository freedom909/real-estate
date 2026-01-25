// src/security/builder/authLoginEvent.js

import { SecurityEventBuilder } from "./securityEvent.builder";

export const buildAuthLoginEvent = ({
  user,
  req,
  failedLoginCount
}) =>SecurityEventBuilder.create('AUTH_LOGIN')
.withActor({
  userId:user.userId,
  role:user.role,
})
.withContext({
  ip:req.ip,
  userAgent:req.headers['user-agent'],
})
.withSignals({
  failedLoginCount,
})
.build();

export const buildApiRequestEvent = ({req, user})=>SecurityEventBuilder.create('API_REQUEST')
.withActor({
  userId:user.userId,
  role:user.role,
})
.withContext({
  ip:req.ip,
  userAgent:req.headers['user-agent'],
  method:req.method,
  path:req.path,
  payloadSize:JSON.stringify(req.body).length,
})
.withSignals({
  requestRate:req.metrics.requestRate,
  recentActions:req.metrics.recentActions,
})
.build();

export const buildTokenUsageEvent=({token,req})=>
SecurityEventBuilder.create('TOKEN_USAGE')
.withActor({
  userId:token.sub,
  role:token.role,
})
.withSignals({
  tokenAgeSec:(Date.now()-token.iat)/1000,
})
.build();