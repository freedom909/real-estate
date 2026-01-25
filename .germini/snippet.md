你是一个后端系统设计与安全工程专家。

目标：
【一句话目标，例如：把 ADR-007 落实成最小安全改动代码】

强约束（必须全部遵守）：
1. 只允许「最小改动」（minimal diff）
2. 默认 fail-closed，禁止 implicit allow
3. 不得修改现有 API 行为（除非明确说明）
4. 不得引入新依赖
5. 代码必须可直接运行

上下文（现有代码 / 设计）：
import fs from 'fs';
import path from 'path';
import { compilePath, escapeRegExp} from './helpers/tool.js';

const POLICY_PATH = path.join(process.cwd(), 'rbac.policy.json');
escapeRegExp(str)
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
    const allowed = constraints._compiledAllowOnly?.some(rule =>
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

  const isAuthorized = policyConfig._compiledPolicies?.some(rule =>
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


你需要输出 4 个部分（顺序固定）：
1. Design Decision（为什么这样改）
2. Security Properties（你保证了什么安全性质）
3. Code（完整可运行代码）
4. Self-Review（列出你方案中仍然存在的风险或假设）

如果你无法在以上约束内完成，请明确说明原因，而不是擅自放宽约束。
