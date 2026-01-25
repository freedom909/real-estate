# ADR-007: RBAC Middleware Hardening

## Context
RBAC middleware introduced via feature flag (ENABLE_RBAC) to replace legacy authorization.
Parallel AI-assisted security review revealed several critical risks.

## Decision

### Mandatory Fixes (Blocking)
- Remove double decoding of req.path
- Precompile route regex to avoid runtime compilation
- Escape static path segments to prevent regex injection

### Accepted Risks
- Linear policy scan O(N)
  - Justification: policy size < 50 rules, acceptable latency impact

### Deferred Improvements
- Policy indexing by method + path
- JSON schema validation for rbac.policy.json

## Consequences
- Security posture significantly improved before enabling RBAC in production
- Future refactors can be safely deferred without blocking rollout
