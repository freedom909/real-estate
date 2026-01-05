// src/subgraphs/user/container/user.container.js
import createContainer from "../../../shared/container/createContainer.js";
import { TOKENS } from "../../../shared/container/tokens.js";
import UserService from "../services/user.service.js";
import UserRepo from "../repositories/user.repo.js";
console.log("TOKENS =", TOKENS);

export function createUserContainer() {
  const container = createContainer();

  // 1️⃣ Repo —— 不依赖任何 Service
  container.register(
    TOKENS.userRepo,
    () => new UserRepo()
  );

  // 2️⃣ Service —— 只依赖 Repo
  container.register(
    TOKENS.userService,
    () =>
      new UserService({
        userRepo: container.resolve(TOKENS.userRepo),
      })
  );

  return container;
}
