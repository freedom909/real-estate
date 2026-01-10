// src/subgraphs/user/repos/user.repo.js
import UserModel from "../models/user.model.js";
import { v4 as uuidv4 } from "uuid";

export default class UserRepo {
  constructor({ UserModel }) {
    if (!UserModel) {
      throw new Error("UserRepo: UserModel is required");
    }
    this.UserModel = UserModel;
  }
  async findOrCreateOAuthUser({
    email,
    fullname,
    picture,
    provider,
    providerSub,
  }) {
    const now = new Date();

    const user = await this.UserModel.findOneAndUpdate( // 
      { provider, providerSub },
      {
        $setOnInsert: {
          userId: uuidv4(),   // ✅ 核心
          email,
          fullname,
          picture,
          provider,
          providerSub,
          role: "USER",
        },
      },
      {
        upsert: true,
        new: true,
      },
      
    );
    
    if (!user.userId) {
      user.userId = uuidv4();
      await user.save();
    }
    
    return user;
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
