// src/subgraphs/user/container/registerUserDependencies.ts

import { container } from "tsyringe";
import { TOKENS } from "../../../shared/container/tokens";
import CredentialModel from "../models/credential.model"
import PolicyEngine from "../../../security/policy.engine";
import UserModel from "../models/user.model";
import UserRepo from "../repos/user.repo";
import UserService from "../../../application/user/services/user.service";
import CredentialRepo from "../repos/credential.repo";

export function registerUserDependencies(container) {

  // =========================
  // Policy Engine
  // =========================
  container.register(TOKENS.security.policyEngine, {
    useFactory: () => new PolicyEngine()
  });

  // =========================
  // Repository
  // =========================
  container.register(TOKENS.user.repos.userRepo, {
    useFactory: () => new UserRepo({ UserModel })
  });

  // =========================
  // Service
  // =========================
  container.register(TOKENS.user.services.userService, {
    useFactory: (c) =>
      new UserService(
        c.resolve(TOKENS.user.repos.userRepo),
        c.resolve(TOKENS.security.policyEngine)
      )
  });
  container.register(TOKENS.auth.models.credential, {
    useValue: CredentialModel
  })

  container.register(TOKENS.auth.repos.credentialRepo, {
    useFactory: (c) =>
      new CredentialRepo({
        CredentialModel: c.resolve(TOKENS.auth.models.credential)
      })
  })
}