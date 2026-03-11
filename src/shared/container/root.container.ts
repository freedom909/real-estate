// src/shared/container/root.container.ts

import { container } from "tsyringe"

import { registerUserDependencies } from "@/subgraphs/user/container/user.container"
import  registerAuthDependencies  from "@/subgraphs/auth/container/registerAuthDependencies"
import registerInfra from "@/infrastructure/infra.container"
import registerSecurity from "@/security/container/security.container"

export function bootstrapContainer() {

  // infra
  registerInfra(container)

  // security
  registerSecurity(container)

  // modules
  registerUserDependencies(container)

  registerAuthDependencies(container)

}