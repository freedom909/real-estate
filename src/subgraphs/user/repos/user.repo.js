// src/subgraphs/user/repos/user.repo.js
import UserModel from "../models/user.model.js";

export default class UserRepo {
  constructor({ UserModel }) {
    this.UserModel = UserModel;
  }
  
    async findByProvider(provider, providerSub) {
    return this.UserModel.findOne({
      provider,
      providerSub,
    });
  }

  findById(userId) {
    return UserModel.findOne({ userId });
  }

  findByEmail(email) {
    return UserModel.findOne({ email });
  }

  findByIdentity(provider, sub) {
    return UserModel.findOne({
      identities: {
        $elemMatch: { provider, sub },
      },
    });
  }

 async create(user) {
    return this.UserModel.create(user);
  }

  async save(user) {
    return this.UserModel.save(user);
  }
}
