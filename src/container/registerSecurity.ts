//src/container/registerSecurity.ts


import { DependencyContainer } from "tsyringe"
import { TOKENS } from "../shared/container/tokens.js"

import PolicyEngine from "@/security/policy.engine"
import AccessTokenBlacklist from "@/security/blacklist/blacklist"

export function registerSecurity(container: DependencyContainer) {

  container.register(
    TOKENS.security.policyEngine,
    { useClass: PolicyEngine }
  )

  container.register(
    TOKENS.security.blacklist,
    { useClass: AccessTokenBlacklist }
  )

}