// src/container/registerUser.ts

import { DependencyContainer } from "tsyringe"
import { TOKENS } from "../shared/container/tokens.js"

import UserService from "@/subgraphs/user/services/user.service"
import UserRepository from "@/subgraphs/user/repos/user.repo"

import UserModel from "@/subgraphs/user/models/user.model"
import ProfileModel from "@subgraphs/user/models/profile.model"

export function registerUser(container: DependencyContainer) {

  // models

  container.register(
    TOKENS.user.models.user,
    { useValue: UserModel }
  )

  container.register(
    TOKENS.user.models.profile,
    { useValue: ProfileModel }
  )

  // repos

  container.register(
    TOKENS.user.repos.userRepo,
    { useClass: UserRepository }
  )

  // services

  container.register(
    TOKENS.user.services.userService,
    { useClass: UserService }
  )

}