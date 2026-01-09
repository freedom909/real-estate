import createContainer from "../../../shared/container/createContainer.js";
import mongoose from "../../../shared/db/mongo.js";
import { TOKENS } from "../../../shared/container/tokens.js";

import UserRepo from "../repos/user.repo.js";
import UserService from "../services/user.service.js";

export function createUserContainer() {
  const container = createContainer();

  // 🥭 Mongo（实例注入）
  container.register(
    TOKENS.mongodb,
    () => mongoose
  );

  // 📦 Repo
  container.register(
    TOKENS.userRepo,
    () =>
      new UserRepo({
        UserModel: mongoose.model("User"),
      })
  );

  // 🧠 Service
  container.register(
    TOKENS.userService,
    () =>
      new UserService({
        userRepo: container.resolve(TOKENS.userRepo),
      })
  );

  return container;
}
