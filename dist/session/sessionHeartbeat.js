export function touchSession(redis, sessionId, sessionData, ttl) {
    return redis.setex(sessionId, ttl, JSON.stringify(sessionData));
}
