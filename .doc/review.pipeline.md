[MODE: PARALLEL_REVIEW]

Context:
Below is production-critical code. Treat it as hostile-environment software.

Task:
Spawn 3 independent review agents.

Rules:
- Agents MUST work independently
- Agents MUST NOT reference each other
- Agents MUST assume different priorities
- Agents MUST NOT try to be polite or balanced
- Agents MUST fail closed

Agents:

Agent A — Security Reviewer
- Assume attackers, compromised tokens, misconfigurations
- Focus: privilege escalation, bypass, default-allow, config injection
- Output: Finding | Severity | Concrete Fix

Agent B — Performance Reviewer
- Assume high QPS (10k+/sec)
- Focus: hot paths, regex, allocations, I/O, sync ops
- Output: Bottleneck | Impact | Optimization

Agent C — Maintainability Reviewer
- Assume 3+ years of ownership by different engineers
- Focus: readability, footguns, config drift, testability
- Output: Pain Point | Risk | Refactor Advice

Code:
import fs from 'fs';
import path from 'path';

const POLICY_PATH = path.join(process.cwd(), 'rbac.policy.json');

/**
 * 1. Default config (fail-closed baseline)
 */
let policyConfig = {
  legacyRoleMapping: {
    ADMIN: 'Admin',
    AGENT: 'Agent',
    PENDING_AGENT: 'Pending_Agent',
    USER: 'Customer',
    GUEST: 'Customer',
  },
  hardConstraints: {},
  policies: [],
};

/**
 * 2. Load & validate policy at startup
 */
try {
  if (!fs.existsSync(POLICY_PATH)) {
    throw new Error(`RBAC policy file missing at ${POLICY_PATH}`);
  }

  const raw = JSON.parse(fs.readFileSync(POLICY_PATH, 'utf-8'));

  // 🔒 Minimal structural validation (fail-closed)
  if (
    !raw ||
    typeof raw !== 'object' ||
    !Array.isArray(raw.policies)
  ) {
    throw new Error('Invalid RBAC policy structure');
  }

  policyConfig = {
    ...policyConfig,          // keep safe defaults
    ...raw,                   // override with policy
    legacyRoleMapping: {
      ...policyConfig.legacyRoleMapping,
      ...raw.legacyRoleMapping,
    },
  };
} catch (err) {
  console.error('[RBAC] Failed to load policy:', err.message);
  // 🚨 Hard stop: better to fail than silently allow
  process.exit(1);
}

export const rbacMiddleware = (req, res, next) => {
  /**
   * 3. Feature flag — FAIL CLOSED
   */
  if (process.env.ENABLE_RBAC !== 'true') {
    return res
      .status(503)
      .json({ error: 'RBAC disabled. Access temporarily unavailable.' });
  }

  /**
   * 4. Authentication required
   */
  if (!req.user || !req.user.role) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const legacyRole = String(req.user.role).toUpperCase();

  /**
   * 5. Role mapping — NO silent downgrade
   */
  const rbacRole = policyConfig.legacyRoleMapping[legacyRole];
  if (!rbacRole) {
    return res.status(403).json({ error: 'Forbidden: Unknown role' });
  }

  /**
   * 6. Guest hard restriction
   */
  if (legacyRole === 'GUEST' && req.method !== 'GET') {
    return res
      .status(403)
      .json({ error: 'Forbidden: Guests are read-only' });
  }

  /**
   * 7. Hard constraints (deny-first)
   */
  const constraints = policyConfig.hardConstraints?.[rbacRole];
  if (constraints?.denyAllWrite && req.method !== 'GET') {
    const allowed = constraints.allowOnly?.some(entry => {
      const [method, rawPath] = entry.split(' ');
      if (method !== req.method) return false;

      const safePath = decodeURIComponent(req.path);
      const regexPath =
        '^' + rawPath.replace(/:\w+/g, '[^/]+') + '$';

      return new RegExp(regexPath).test(safePath);
    });

    if (!allowed) {
      return res.status(403).json({ error: 'Forbidden by hard constraint' });
    }
  }

  /**
   * 8. Policy match (explicit allow only)
   */
  const isAuthorized = policyConfig.policies.some(rule => {
    if (!rule.roles?.includes(rbacRole)) return false;
    if (!rule.methods?.includes(req.method)) return false;

    const safePath = decodeURIComponent(req.path);
    const regexPath =
      '^' + rule.path.replace(/:\w+/g, '[^/]+') + '$';

    return new RegExp(regexPath).test(safePath);
  });

  if (!isAuthorized) {
    return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
  }

  return next();
};


Deliverables:
1. Each agent outputs separately
2. Then provide a merged "Risk Register" table
3. No code changes yet
