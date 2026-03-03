// src/subgraphs/user/container/registerUserDependencies.ts

import { container } from "tsyringe";
import { TOKENS } from "../../../shared/container/tokens.js";

import PolicyEngine from "../../../security/policy.engine.js";
import UserModel from "../models/user.model.js";
import UserRepo from "../repos/user.repo.js";
import UserService from "../../../application/user/services/user.service.js";

export function registerUserDependencies() {

  // =========================
  // Policy Engine
  // =========================
  container.register(TOKENS.security.policyEngine, {
    useClass: PolicyEngine,
  });

  // =========================
  // Repository
  // =========================
  container.register(TOKENS.user.userRepo, {
    useFactory: () =>
      new UserRepo({ UserModel }),
  });

  // =========================
  // Service
  // =========================
  container.register(TOKENS.user.userService, {
    useFactory: (c) =>
      new UserService(
        c.resolve(TOKENS.user.userRepo),
        c.resolve(TOKENS.security.policyEngine)
      ),
  });

}