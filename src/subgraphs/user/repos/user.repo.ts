// src/subgraphs/user/repos/user.repo.ts
import { Document, HydratedDocument, Model, Types } from "mongoose";
import UserModel, { IUserDB } from "../models/user.model.js";

export type IUserDBObject = IUserDB & {
  _id: Types.ObjectId;
};

export interface IUserRepo {
  findById(id: string): Promise<IUserDBObject | null>;
  findByEmail(email: string): Promise<IUserDBObject | null>;
  create(user: Partial<IUserDB>): Promise<IUserDBObject>;
  update(id: string, user: Partial<IUserDB>): Promise<IUserDBObject | null>;
  deactivate(id: string): Promise<void>;
}

export default class UserRepo implements IUserRepo {

  private UserModel: Model<IUserDB>;

  constructor({ UserModel }: { UserModel: Model<IUserDB> }) {
    if (!UserModel) throw new Error("UserRepo: UserModel is required");
    this.UserModel = UserModel;
  }

findByEmail(email: string) {
  return this.UserModel.findOne({ email }).lean<IUserDBObject>();
}

findById(id: string) {
  return this.UserModel.findById(id).lean<IUserDBObject>();
}

async create(data: Partial<IUserDB>) {
  const created = await this.UserModel.create(data);
  return created.toObject() as IUserDBObject;
}

  async deactivate(id: string): Promise<void> {
    return await this.UserModel.findByIdAndUpdate(id, { status: "INACTIVE" });
  }

async update(id: string, user: Partial<IUserDB>): Promise<IUserDBObject | null> {
  return this.UserModel.findByIdAndUpdate(id, user, { new: true }).lean<IUserDBObject>();
}

async updateLastLogin(userId: string) {

  return this.UserModel.findByIdAndUpdate(
    userId,
    { lastLoginAt: new Date() }
  );
}
}