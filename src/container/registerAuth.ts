// src/container/registerAuth.ts

import { DependencyContainer } from "tsyringe"
import { TOKENS } from "../shared/container/tokens.js"

import AuthService from "@/subgraphs/auth/services/auth.service"
import {TokenService} from "@/subgraphs/auth/services/token.service"
import OAuthService from "@/subgraphs/auth/services/oauth.service"

import CredentialRepository from "@/subgraphs/auth/repos/credential.repo"
import RefreshTokenRepository from "@/subgraphs/authz/repos/refresh-token.repo.js"
import RiskEventRepository from "@/subgraphs/auth/repos/riskEvent.repo"

import CredentialModel from "@/subgraphs/auth/models/credential.model"
import RefreshTokenModel from "@/subgraphs/auth/models/refreshToken.model"
import RiskEventModel from "@/subgraphs/auth/models/riskEvent.model"

export function registerAuth(container: DependencyContainer) {

  // =========================
  // Models
  // =========================

  container.register(
    TOKENS.auth.models.credential,
    { useValue: CredentialModel }
  )

  container.register(
    TOKENS.auth.models.refreshToken,
    { useValue: RefreshTokenModel }
  )

  container.register(
    TOKENS.auth.models.riskEvent,
    { useValue: RiskEventModel }
  )

  // =========================
  // Repositories
  // =========================

  container.register(
    TOKENS.auth.repos.credentialRepo,
    { useClass: CredentialRepository }
  )

  container.register(
    TOKENS.auth.repos.refreshTokenRepo,
    { useClass: RefreshTokenRepository }
  )

  container.register(
    TOKENS.auth.repos.riskEventRepo,
    { useClass: RiskEventRepository }
  )

  // =========================
  // Services
  // =========================

  container.register(
    TOKENS.auth.services.authService,
    { useClass: AuthService }
  )

  container.register(
    TOKENS.auth.services.tokenService,
    { useClass: TokenService }
  )

  container.register(
    TOKENS.auth.services.oauthService,
    { useClass: OAuthService }
  )

}