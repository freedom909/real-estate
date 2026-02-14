// src/subgraphs/user/repos/user.repo.ts
import { Document, Model } from "mongoose";
import UserModel, { IUser } from "../models/user.model.js";

interface IUserDocument extends IUser, Document {}

export default class UserRepo {
  async deactivate(userId: string) {
    return await this.UserModel.findByIdAndUpdate(userId, { status: "INACTIVE" });
  }
  private UserModel: Model<IUserDocument>;

  constructor({ UserModel }: { UserModel: Model<IUserDocument> }) {
    console.log("UserRepo ctor UserModel =", UserModel)
    if (!UserModel) throw new Error("UserRepo: UserModel is required");// "message": "UserService: userRepo is required",
    this.UserModel = UserModel;
  }

  findByEmail(email: string) {
    return this.UserModel.findOne({ email });
  }

  findById(id: string) {
    return this.UserModel.findById(id);// this works
  }


  create(data: Partial<IUser>) {
    return this.UserModel.create(data);
  }
}