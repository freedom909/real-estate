/**
 * Security Model:
 * See .doc/security/RBAC_THREAT_MODEL.md
 */

import fs from 'fs';
import path from 'path';
import { compilePath, escapeRegExp } from './helpers/tool.js';

const POLICY_PATH = path.join(process.cwd(), 'rbac.policy.json');

// Helper for structured audit logging (Agent A requirement)
const logAudit = (event, req, details) => {
  // In production, this should go to a structured logger (e.g., Winston/Pino)
  // For now, we use console with a specific prefix for log ingestion
  const logPayload = JSON.stringify({
    timestamp: new Date().toISOString(),
    event,
    user: req.user?.id || 'anonymous',
    role: req.user?.role || 'none',
    method: req.method,
    path: req.path,
    ...details
  });
  
  if (event === 'RBAC_DENY' || event === 'RBAC_DRY_RUN_VIOLATION') {
    console.warn(`[RBAC] ${logPayload}`);
  } else {
    console.info(`[RBAC] ${logPayload}`);
  }
};

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
  dryRun: false, // Agent A/C: Default to enforcing, but allow override
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
  
  // 🔒 预编译 policies
  policyConfig._compiledPolicies = policyConfig.policies.map(p => ({
    methods: p.methods,
    allow: p.allow,
    regex: compilePath(p.path)
  }));
  
  // 🔒 预编译 hardConstraints.allowOnly
  for (const role in policyConfig.hardConstraints) {
    const hc = policyConfig.hardConstraints[role];
    if (hc.allowOnly) {
      hc._compiledAllowOnly = hc.allowOnly.map(entry => {
        const [method, path] = entry.split(' ');
        return {
          method,
          regex: compilePath(path)
        };
      });
    }
  }
  
  console.log(`[RBAC] Policy loaded. Mode: ${policyConfig.dryRun ? 'DRY-RUN (Log Only)' : 'ENFORCING'}`);

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
  if (!req.user) {
    logAudit('AUTH_MISSING', req, {});
    return res.status(401).json({ error: 'Unauthorized' });
  }

  /**
   * 4.1 Temporary Grants (TTL-based)
   * Checks for granular, time-bound overrides in the token.
   */
  if (Array.isArray(req.user.tempGrants)) {
    // 🔒 Security: JWT exp is in seconds (RFC 7519). Date.now() is ms.
    const nowSeconds = Math.floor(Date.now() / 1000);

    const activeGrant = req.user.tempGrants.find(g => {
      // 1. Expiration is mandatory for temporary grants to prevent permanent backdoors
      if (!g.exp) return false;
      
      // 2. Check expiration (fail-closed if expired)
      if (g.exp < nowSeconds) return false;

      // 3. Strict path/method matching (no regex to prevent ReDoS/bypass)
      return g.method === req.method && g.path === req.path;
    });

    if (activeGrant) {
      logAudit('RBAC_GRANT_ALLOW', req, { grant: activeGrant });
      return next();
    }
  }

  // Resolve effective role based on Tenant Context
  const tenantId = req.headers['x-tenant-id'];
  let rawRole = req.user.role || 'GUEST'; // Default to global role or Guest

  if (tenantId) {
    // 🔒 Isolation: If acting in a tenant context, IGNORE global role.
    // Must have explicit role in that org, otherwise downgrade to GUEST.
    // This prevents "Global Admin" from implicitly being "Org Admin".
    rawRole = req.user.orgRoles?.[tenantId] || 'GUEST';
  }

  const legacyRole = String(rawRole).toUpperCase();

  /**
   * 5. Role mapping — NO silent downgrade
   */
  const rbacRole = policyConfig.legacyRoleMapping[legacyRole];
  if (!rbacRole) {
    logAudit('ROLE_UNKNOWN', req, { legacyRole });
    return res.status(403).json({ error: 'Forbidden: Unknown role' });
  }

  // Helper to handle denial based on dryRun mode
  const handleDeny = (reason) => {
    if (policyConfig.dryRun) {
      logAudit('RBAC_DRY_RUN_VIOLATION', req, { reason, rbacRole });
      return next(); // Allow in dry-run
    }
    logAudit('RBAC_DENY', req, { reason, rbacRole });
    return res.status(403).json({ error: reason });
  };

  /**
   * 6. Guest hard restriction
   */
  if (legacyRole === 'GUEST' && req.method !== 'GET') {
    return handleDeny('Forbidden: Guests are read-only');
  }

  /**
   * 7. Hard constraints (deny-first)
   */
  const constraints = policyConfig.hardConstraints?.[rbacRole];

  if (constraints?.denyAllWrite && req.method !== 'GET') {
    const allowed = constraints._compiledAllowOnly?.some(rule =>
      rule.method === req.method && rule.regex.test(req.path)
    );

    if (!allowed) {
      return handleDeny('Forbidden: Write access denied for this role.');
    }
  }

  /**
   * 8. Policy match (explicit allow only)
   */
  const isAuthorized = policyConfig._compiledPolicies?.some(rule =>
    rule.methods.includes(req.method) &&
    rule.allow.includes(rbacRole) &&
    rule.regex.test(req.path)
  );

  if (!isAuthorized) {
    return handleDeny('Forbidden: Insufficient permissions.');
  }

  // Agent A: Log successful access in debug/audit mode if needed, 
  // but usually we only log denials to save volume.
  return next();
};
