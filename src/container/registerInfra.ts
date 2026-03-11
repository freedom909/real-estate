//src/container.ts

// src/container/registerInfra.ts

import { DependencyContainer } from "tsyringe"
import { TOKENS } from "../shared/container/tokens.js"

import Redis from "ioredis"
import NodeCache from "node-cache"
import pino from "pino"

 function registerInfra(container: DependencyContainer) {

  container.register(
    TOKENS.infra.redis,
    {
      useValue: new Redis(process.env.REDIS_URL!)
    }
  )

  container.register(
    TOKENS.infra.cache,
    {
      useValue: new NodeCache()
    }
  )

  container.register(
    TOKENS.infra.logger,
    {
      useValue: pino()
    }
  )

}

export default registerInfra