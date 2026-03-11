// src/container/registerDependencies.ts

import { container } from "tsyringe"

import  registerInfra  from "./registerInfra.js"
import { registerSecurity } from "./registerSecurity.js"
import { registerAuth } from "./registerAuth.js"
import { registerUser } from "./registerUser.js"

export function registerDependencies() {

  registerInfra(container)

  registerSecurity(container)

  registerAuth(container)

  registerUser(container)

}