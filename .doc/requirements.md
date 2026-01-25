# SecurityEvent Requirements

## Required fields

- eventId (String)
- action (String: business or auth action)

- actor (Object)
  - userId (String | null)
  - role (String)
  - isAuthenticated (Boolean)

- context (Object)
  - ip (String)
  - userAgent (String)
  - requestId (String)

- resource (Object)
  - type (String)
  - id (String | null)

- signals (Object)

## Optional fields

- payload (Object)
  - Sanitized business input
  - MUST NOT include secrets, passwords, or tokens

- history (Object)
  - recentEvents (Array of Objects)

## Default behavior

If data is missing, invalid, or insufficient:
- riskLevel = MEDIUM
- suggestedAction = CHALLENGE
- confidence <= 0.5
- include signal "insufficient_context"
 