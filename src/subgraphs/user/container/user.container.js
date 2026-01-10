import createContainer from "../../../shared/container/createContainer.js";
import { TOKENS } from "../../../shared/container/tokens.js";
import UserModel from "../models/user.model.js";
import UserRepo from "../repos/user.repo.js";
import UserService from "../services/user.service.js";

export function createUserContainer() {
  const container = createContainer();

  // ✅ Repo（先注册）
  container.register(
    TOKENS.user.userRepo,
    () =>
      new UserRepo({
        UserModel,   // 👈 真实 mongoose model
      })
  );

  // ✅ Service（后注册）
  container.register(
    TOKENS.user.userService,
    () =>
      new UserService({
        userRepo: container.resolve(TOKENS.user.userRepo),
      })
  );

  return container;
}


