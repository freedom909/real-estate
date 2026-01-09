// subgraphs/user/repos/user.repo.js
import UserModel from "../models/user.model.js";

export default class UserRepo {
  async findByEmail(email) {
    return UserModel.findOne({ email });
  }

  async findByProviderSub(provider, sub) {
    return UserModel.findOne({
      provider,
      sub,
    });
  }

  async create(data) {
    return UserModel.create(data);
  }

  async save(user) {
    return user.save();
  }
}
