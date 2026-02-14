import fs from 'fs';
import path from 'path';
import { compilePath, escapeRegExp } from './helpers/tool.js';

const POLICY_PATH: string = path.join(process.cwd(), 'rbac.policy.json');
// escapeRegExp(str)

interface Policy {
  methods: string[];
  allow: string[];
  path: string;
}

interface CompiledPolicy {
  methods: string[];
  allow: string[];
  regex: RegExp;
}

interface CompiledAllowOnly {
  method: string;
  regex: RegExp;
}

interface HardConstraint {
  denyAllWrite?: boolean;
  allowOnly?: string[];
  _compiledAllowOnly?: CompiledAllowOnly[];
}

interface PolicyConfig {
  legacyRoleMapping: Record<string, string>;
  hardConstraints: Record<string, HardConstraint>;
  policies: Policy[];
  _compiledPolicies?: CompiledPolicy[];
}

interface RawPolicyConfig {
  legacyRoleMapping?: Record<string, string>;
  hardConstraints?: Record<string, HardConstraint>;
  policies?: Policy[];
  [key: string]: unknown;
}

/**
 * 1. Default config (fail-closed baseline)
 */
let policyConfig: PolicyConfig = {
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

  const raw: unknown = JSON.parse(fs.readFileSync(POLICY_PATH, 'utf-8'));

  // 🔒 Minimal structural validation (fail-closed)
  if (
    !raw ||
    typeof raw !== 'object' ||
    !Array.isArray((raw as RawPolicyConfig).policies)
  ) {
    throw new Error('Invalid RBAC policy structure');
  }

  const rawConfig = raw as RawPolicyConfig;

  policyConfig = {
    ...policyConfig,          // keep safe defaults
    ...rawConfig,             // override with policy
    legacyRoleMapping: {
      ...policyConfig.legacyRoleMapping,
      ...(rawConfig.legacyRoleMapping || {}),
    },
    hardConstraints: (rawConfig.hardConstraints || policyConfig.hardConstraints) as Record<string, HardConstraint>,
    policies: (rawConfig.policies || policyConfig.policies) as Policy[]
  };

  // 🔒 预编译 policies
  policyConfig._compiledPolicies = policyConfig.policies.map((p: Policy): CompiledPolicy => ({
    methods: p.methods,
    allow: p.allow,
    regex: compilePath(p.path)
  }));

  // 🔒 预编译 hardConstraints.allowOnly
  for (const role in policyConfig.hardConstraints) {
    const hc: HardConstraint = policyConfig.hardConstraints[role];
    if (hc.allowOnly) {
      hc._compiledAllowOnly = hc.allowOnly.map((entry: string): CompiledAllowOnly => {
        const [method, pathStr] = entry.split(' ');
        return {
          method,
          regex: compilePath(pathStr)
        };
      });
    }
  }
} catch (err: unknown) {
  const errorMessage = err instanceof Error ? err.message : String(err);
  console.error('[RBAC] Failed to load policy:', errorMessage);
  // 🚨 Hard stop: better to fail than silently allow
  process.exit(1);
}

interface Request {
  user?: {
    role?: string | number;
    [key: string]: unknown;
  };
  method: string;
  path: string;
  [key: string]: unknown;
}

interface Response {
  status: (code: number) => Response;
  json: (body: unknown) => Response;
  [key: string]: unknown;
}

type NextFunction = () => void;

export const rbacMiddleware = (req: Request, res: Response, next: NextFunction): Response | void => {
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

  const legacyRole: string = String(req.user.role).toUpperCase();

  /**
   * 5. Role mapping — NO silent downgrade
   */
  const rbacRole: string | undefined = policyConfig.legacyRoleMapping[legacyRole];
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
  const constraints: HardConstraint | undefined = policyConfig.hardConstraints?.[rbacRole];

  if (constraints?.denyAllWrite && req.method !== 'GET') {
    const allowed: boolean | undefined = constraints._compiledAllowOnly?.some((rule: CompiledAllowOnly) =>
      rule.method === req.method && rule.regex.test(req.path)
    );

    if (!allowed) {
      return res.status(403).json({
        error: 'Forbidden: Write access denied for this role.'
      });
    }
  }


  /**
   * 8. Policy match (explicit allow only)
   */

  const isAuthorized: boolean | undefined = policyConfig._compiledPolicies?.some((rule: CompiledPolicy) =>
    rule.methods.includes(req.method) &&
    rule.allow.includes(rbacRole) &&
    rule.regex.test(req.path)
  );

  if (!isAuthorized) {
    return res.status(403).json({
      error: 'Forbidden: Insufficient permissions.'
    });
  }

  return next();
};