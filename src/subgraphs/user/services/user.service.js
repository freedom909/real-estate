import { Role } from "../models/user.model.js";

export default class UserService {
  constructor({ userRepo }) {
    this.userRepo = userRepo;
  }

async findOrCreateOAuthUser(input) {
    const existing =
      await this.userRepo.findByProvider(
        input.provider,
        input.providerSub
      );

    if (existing) return existing;

    return this.userRepo.create({
      email: input.email,
      fullname: input.fullname,
      picture: input.picture,
      provider: input.provider,
      providerSub: input.providerSub,
      role: "USER",
    });
  }
}
