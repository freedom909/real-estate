// src/subgraphs/user/repos/user.repo.js
import UserModel from "../models/user.model.js";
// user.repo.js
export default class UserRepo {
  constructor({ UserModel }) { 
    console.log("UserRepo ctor UserModel =", UserModel)
    if (!UserModel) throw new Error("UserRepo: UserModel is required");// "message": "UserService: userRepo is required",
    this.UserModel = UserModel;
  }

  findByEmail(email) {
    return this.UserModel.findOne({ email });
  }

  findById(id) {
    return this.UserModel.findById(id);// this works
  }


  create(data) {
    return this.UserModel.create(data);
  }
}

