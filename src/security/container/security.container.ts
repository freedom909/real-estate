// src/security/container/security.container.ts
import RiskEventRepo from "@/subgraphs/auth/repos/riskEvent.repo"
import { TOKENS } from "../../shared/container/tokens"
import Blacklist from "@/security/blacklist/blacklist.js"
import SessionRepo from "@/subgraphs/auth/repos/session.repo"
import { createRedis } from "@/infrastructure/redis/redis"

export default function registerSecurity(container) {

  const redis = createRedis()

  container.register(
    TOKENS.security.blacklist,
    () => new Blacklist(redis)
  )

  container.register(
    TOKENS.auth.sessionRepo,
    () =>
      new SessionRepo({
        SessionModel: container.resolve(
          TOKENS.auth.sessionModel
        )
      })
  )
}