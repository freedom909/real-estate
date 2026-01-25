Required fields:
eventId (String)
action (String: business or auth action)
actor (Object: { userId, role, isAuthenticated })
context (Object: { ip, userAgent, requestId })
resource (Object: { type, id })
signals (Object)

Optional fields:
payload (Object: sanitized business input)
history (Object: recent related events)

If uncertain or insufficient data:
- Default to riskLevel = MEDIUM
- suggestedAction = CHALLENGE
- confidence <= 0.5
- Include signal: "insufficient_context"
