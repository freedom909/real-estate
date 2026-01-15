// src/subgraphs/user/repos/user.repo.js
export default class UserRepo {
  constructor({ UserModel }) {
    if (!UserModel) {
      throw new Error("UserRepo: UserModel is required");
    }
    this.UserModel = UserModel;
  }

  async create({ email, role, status, profile, authSource  }) {
  
    console.log("🔥 UserRepo.create CALLED with data:");// data is undifined, userRepo is injected?
    const user = await this.UserModel.create({
      email,
      role: "USER",
      status: "ACTIVE",
      profile,
      authSource
    });
    console.log("✅ User created:", user.toObject());
    return user;
  }

  findById(userId) {
    return this.UserModel.findOne({ userId });
  }

  findByEmail(email) {
    return this.UserModel.findOne({ email });
  }

}
