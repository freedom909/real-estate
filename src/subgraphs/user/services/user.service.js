import { Role } from "../models/user.model.js";

export default class UserService {
  constructor({ userRepo }) {
    this.userRepo = userRepo;
  }

  async findOrCreateOAuthUser(input) {
    return this.userRepo.findOrCreateOAuthUser(input);
  }

  async findById(userId) {
    return this.userRepo.findById(userId);
  }
}
