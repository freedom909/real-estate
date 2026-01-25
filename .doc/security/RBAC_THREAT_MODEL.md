RBAC Threat Model (STRIDE)

Component: rbacMiddleware
Scope: Authorization enforcement for all HTTP requests
Environment: Node.js / Express production backend
Policy Source: rbac.policy.json (version-controlled)

1. System Overview

The RBAC middleware enforces authorization decisions based on:

Authenticated user identity (req.user)

Legacy role → RBAC role mapping (in-memory)

Explicit allow rules defined in rbac.policy.json

Hard constraints that override standard policies for high-risk roles

High-level Flow

Reject requests if RBAC is disabled (fail-closed)

Require authenticated user

Map legacy role to RBAC role (no silent fallback)

Apply hard runtime restrictions (e.g., GUEST read-only)

Enforce hard constraints (denyAllWrite)

Match request against explicitly allowed policies

Deny by default

2. Trust Boundaries

| Boundary               | Description                                                  |
| ---------------------- | ------------------------------------------------------------ |
| Client → API           | Untrusted. All request data is hostile.                      |
| Auth Middleware → RBAC | `req.user` is trusted **only** if auth middleware succeeded. |
| Policy File            | Trusted, version-controlled, reviewed artifact.              |
| RBAC Middleware        | Security-critical trusted component.                         |

3. Assumptions (Explicit)

The following assumptions are required for security correctness:

Policy File Trust

rbac.policy.json is version-controlled

Changes require code review

Not writable at runtime by attackers

Path Normalization

req.path is already URL-decoded by Express

No additional decoding is performed

Regex Safety

compilePath() fully escapes static path segments

Only :param tokens are converted to [^/]+

Middleware Order

RBAC middleware runs after authentication

RBAC middleware runs after any path-rewriting middleware

Fail-Fast Startup

Failure to load or validate RBAC policy is a fatal startup error

This is an intentional design choice

4. STRIDE Analysis
S — Spoofing Identity
Threat	Mitigation
Forged user identity	RBAC requires req.user from upstream auth middleware
Role spoofing via malformed role string	Roles normalized and mapped explicitly; unknown roles are rejected

✅ Residual Risk: Depends on authentication middleware correctness (out of scope).

T — Tampering
Threat	Mitigation
Policy modification at runtime	Policy loaded at startup only
Tampered request path to bypass rules	No double-decoding; regex matching on normalized req.path

⚠️ Residual Risk: If attacker gains filesystem write access, all bets are off (out of scope).

R — Repudiation
Threat	Mitigation
User denies performing an action	Authorization decision is deterministic and reproducible
Policy ambiguity	Explicit allow rules; no implicit inheritance

⚠️ Known Gap: Authorization decisions are not currently logged.

📌 Deferred improvement: Add structured audit logs for deny/allow events.

I — Information Disclosure
Threat	Mitigation
Discovering protected routes	Uniform 403 responses; no role leakage
Inferring role capabilities	No descriptive error messages

✅ Residual Risk: Route discovery via brute-force remains possible (standard API risk).

D — Denial of Service
Threat	Mitigation
Expensive authorization checks	Regexes precompiled at startup
Policy file corruption	Fail-fast at startup (process exit)

⚠️ Accepted Risk (ADR-007):

Linear policy scan O(N) per request

Acceptable under current policy size (<50 rules)

E — Elevation of Privilege
Threat	Mitigation
Silent role downgrade to permissive role	No fallback role; unknown roles denied
Admin inheriting Customer implicitly	Explicit role allow lists only
Bypassing hard constraints	Hard constraints evaluated before policies
Guest performing writes	Hard-coded runtime block

✅ Residual Risk: None identified within defined assumptions.

5. Security Invariants (Must Always Hold)

Authorization is explicit allow only

Unknown roles are denied

Hard constraints override policy rules

RBAC cannot be bypassed when enabled

Startup failure is preferable to permissive behavior

6. Accepted Risks (ADR-007)
Risk	Justification
Linear policy scan	Policy size small and bounded
No JSON schema validation	Policy trusted and reviewed
No runtime policy reload	Stability > flexibility

7. Out of Scope

Authentication correctness

Token/session security

Filesystem compromise

Insider threat modifying policy in repo

8. Summary

This RBAC middleware implements a fail-closed, deny-by-default authorization model with explicit role mapping and hard constraints.
Under the documented assumptions, no viable privilege escalation or policy bypass paths are known.