// 🔧 基础设施容器
//src/shared/container/infra.container.ts

import { TOKENS } from "../../shared/container/tokens"
import { createRedis } from "../../infrastructure/redis/redis"

export default function registerInfra(container) {

  const redis = createRedis()

  container.register(
    TOKENS.infra.redis,
    () => redis
  )
}