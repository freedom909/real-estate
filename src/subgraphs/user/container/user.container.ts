// src/subgraphs/user/container/user.container.ts
import PolicyEngine from "../../../security/policy.engine.js";
import createContainer from "../../../shared/container/createContainer.js";
import { TOKENS } from "../../../shared/container/tokens.js";

import UserModel from "../models/user.model.js";
import UserRepo from "../repos/user.repo.js";
import UserService from "../services/user.service.js";

export function createUserContainer() {
  const container = createContainer();

  // =========================
  // Repository
  // =========================
  container.register(
    TOKENS.user.userRepo,
    
    () => new UserRepo({ UserModel }),

  );
console.log("userRepo:", new UserRepo({ UserModel }))
  // =========================
  // Service
  // =========================
  container.register(
    TOKENS.user.userService,
    () =>
      new UserService(
        container.resolve(TOKENS.user.userRepo),
        container.resolve(TOKENS.security.policyEngine)
      )
  );

  container.register(
    TOKENS.security.policyEngine,
    
    () => new PolicyEngine()
  );

  // 🔍 Debug only (safe)
console.log("DI keys:", container._debugTokens());


  return container;
}