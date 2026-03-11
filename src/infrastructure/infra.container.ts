// 基础设施容器
//src/shared/container/infra.container.ts

import { TOKENS } from "./../shared/container/tokens"
import { createRedis } from "./redis/redis"

export default function registerInfra(container) {

  container.register(
    TOKENS.infra.redis,
    () => createRedis()
  )

}