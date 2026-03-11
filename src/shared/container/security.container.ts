// 🔧 安全容器
//src/shared/container/security.container.ts

import { TOKENS } from "./tokens"
import Blacklist from "@/security/blacklist/blacklist.js"

export default function registerSecurity(container) {

  const redis = container.resolve(TOKENS.infra.redis)

  container.register(
    TOKENS.security.blacklist,
    () => new Blacklist(redis)
  )

}