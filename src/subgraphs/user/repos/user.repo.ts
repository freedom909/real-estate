// src/subgraphs/user/repos/user.repo.ts
import { Document, HydratedDocument, Model } from "mongoose";
import UserModel, { IUser } from "../models/user.model.js";

export interface IUserRepo {
  findById(id: string): Promise<IUser | null>;
  findByEmail(email: string): Promise<IUser | null>;
  create(user: IUser): Promise<IUser>;
  deactivate(id: string): Promise<void>;
}
type UserDocument = HydratedDocument<IUser>;

export default class UserRepo implements IUserRepo {

  private UserModel: Model<IUser>;

  constructor({ UserModel }: { UserModel: Model<UserDocument> }) {
    console.log("UserRepo ctor UserModel =", UserModel)
    if (!UserModel) throw new Error("UserRepo: UserModel is required");// "message": "UserService: userRepo is required",
    this.UserModel = UserModel;
  }

  findByEmail(email: string) {
    return this.UserModel.findOne({ email }).lean();
  }

  findById(id: string) {
    return this.UserModel.findById(id).lean();
  }

  async deactivate(id: string): Promise<void> {
    return await this.UserModel.findByIdAndUpdate(id, { status: "INACTIVE" });
  }

  async create(data: Partial<IUser>) {
    const created = await this.UserModel.create(data);
    return created.toObject();
  }
}