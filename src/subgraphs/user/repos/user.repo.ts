// src/subgraphs/user/repos/user.repo.ts
import { Document, HydratedDocument, Model } from "mongoose";
import UserModel, { IUserDB } from "../models/user.model.js";

export interface IUserRepo {
  findById(id: string): Promise<IUserDB | null>;
  findByEmail(email: string): Promise<IUserDB | null>;
  create(user: IUserDB): Promise<IUserDB>;
  update(id: string, user: IUserDB): Promise<IUserDB | null>;
  deactivate(id: string): Promise<void>;
}
type UserDocument = HydratedDocument<IUserDB>;

export default class UserRepo implements IUserRepo {

  private UserModel: Model<IUserDB>;

  constructor({ UserModel }: { UserModel: Model<UserDocument> }) {
    console.log("UserRepo ctor UserModel =", UserModel)
    if (!UserModel) throw new Error("UserRepo: UserModel is required");// "message": "UserService: userRepo is required",
    this.UserModel = UserModel;
  }
  update(id: string, user: IUserDB): Promise<IUserDB | null> {
    throw new Error("Method not implemented.");
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

  async create(data: Partial<IUserDB>) {
    const created = await this.UserModel.create(data);
    return created.toObject();
  }
}