# ADR-008: Stateless Multi-Tenant RBAC Strategy

## Status
Accepted

## Context
The platform is evolving from a single-tenant application to a multi-tenant SaaS model.
We require:
1.  **Tenant Isolation**: Users may have different roles in different organizations (e.g., Admin in Org A, Viewer in Org B).
2.  **Temporary Access**: Support staff or temporary agents need time-bound access to specific resources without permanent role elevation.
3.  **Performance**: The system must maintain low latency and high availability.

**Constraints:**
- No per-request database lookups (Zero-Latency Authorization).
- No database schema migrations for the authorization layer.
- Fail-closed security model.

## Decision
We will adopt a **Stateless Carrier Strategy** using the JWT Access Token to transport authorization state.

### 1. The Carrier (JWT)
The JWT payload will be expanded to include:
- `orgRoles`: A dictionary mapping Organization IDs to Roles.
  ```json
  "orgRoles": {
    "org_123": "Admin",
    "org_456": "Viewer"
  }
  ```
- `tempGrants`: An array of temporary, granular permissions.
  ```json
  "tempGrants": [
    {
      "method": "POST",
      "path": "/listings/999",
      "exp": 1715000000
    }
  ]
  ```

### 2. Tenant Context Resolution
- Clients **MUST** provide an `X-Tenant-ID` header to operate within a specific organization context.
- **Isolation Logic**:
    - If `X-Tenant-ID` is present: The middleware **ignores** the global `role` and strictly looks up the role in `orgRoles[tenantId]`. If missing, it defaults to `GUEST` (or denies access).
    - If `X-Tenant-ID` is absent: The middleware falls back to the legacy global `role` (Backward Compatibility).

### 3. Temporary Grants (TTL)
- Grants are evaluated **before** role checks.
- Grants **MUST** have an `exp` (expiration timestamp).
- Validation is performed against the server's local clock.

## Alternatives Considered

### Option 1: Database Lookup per Request
*   **Description**: Middleware queries the `UserRole` table on every request using `(userId, tenantId)`.
*   **Pros**: Instant revocation; always consistent.
*   **Cons**: Adds 10-50ms latency per request; introduces a single point of failure (DB); violates "No per-request DB call" constraint.
*   **Verdict**: Rejected.

### Option 2: Distributed Cache (Redis)
*   **Description**: Cache user permissions in Redis on login; middleware checks Redis.
*   **Pros**: Faster than DB; allows revocation (by deleting cache key).
*   **Cons**: Adds network hop; requires cache invalidation logic; adds infrastructure dependency for the critical path.
*   **Verdict**: Rejected in favor of pure statelessness to maximize reliability and minimize latency.

### Option 3: Stateless JWT (Selected)
*   **Description**: Embed all necessary state in the signed token.
*   **Pros**: Zero network latency; horizontally scalable; no external dependencies for verification.
*   **Cons**: Token size limits; revocation lag (window of exposure = token TTL).
*   **Verdict**: Accepted. The performance and reliability benefits outweigh the revocation lag for our use case.

## Security Implications

### 1. Strict Tenant Isolation
The system enforces a "Split-Horizon" view of identity. A user is never "just an Admin"; they are "Admin *in context of* Org A". The middleware prevents context bleeding by strictly scoping role resolution to the provided `X-Tenant-ID`.

### 2. Cryptographic Integrity
Trust is anchored in the JWT signature. Since the middleware does not look up the DB, it relies entirely on the upstream Auth Service to correctly populate and sign the `orgRoles`.

### 3. Fail-Closed Expiration
Temporary grants are validated with `now < grant.exp`. If the token is valid but the specific grant has expired, access is denied. This allows short-lived permissions (minutes) inside a longer-lived token (hours).

## Explicit Assumptions
1.  **Upstream Trust**: The Auth Service (Token Issuer) is trusted to verify tenant membership before signing the token.
2.  **Clock Synchronization**: All server nodes use NTP. Clock skew is minimal (< 5s).
3.  **Token Size**: The number of organizations a single user belongs to is small enough that the JWT fits within HTTP header limits (typically 8KB).
4.  **Path Normalization**: The upstream issuer and this middleware agree on path canonicalization (e.g., no trailing slashes) to ensure `tempGrants` match correctly.

## Accepted Risks
1.  **Revocation Lag**: If a user is removed from an Org, they retain access until their short-lived Access Token expires (e.g., 15-60 minutes).
    *   *Mitigation*: Keep Access Token TTL short; use Refresh Tokens for long sessions.
2.  **Token Bloat**: Extreme edge cases (user in 100+ orgs) may cause header overflow.
    *   *Mitigation*: Auth Service should support "Scoped Tokens" (exchange global token for single-org token) if this becomes a problem.

## Non-Goals
- **Real-Time Revocation**: Immediate kill-switch for active tokens is out of scope for the stateless layer (requires a blacklist/cache).
- **Resource-Level ACLs**: This system handles Role-Based access (RBAC). Ownership checks (e.g., "Can I edit *my* profile?") remain in the Controller/Service layer, though `tempGrants` provide a bridge for specific exceptions.