// src/subgraphs/user/services/user.service.js



export default class UserService {

  constructor({ userRepo }) {
    this.userRepo = userRepo;
  }

  async findOrCreateByOAuth(input) {
    console.log("🧠 UserService input:", input);

    let user = await this.userRepo.findByOAuth(
      input.provider,
      input.providerUserId
    );

    console.log("🔍 findByOAuth result:", user);

    if (!user) {
      user = await this.userRepo.create({
        provider: input.provider,
        providerUserId: input.providerUserId,
        email: input.email,
        role: "USER",
      });

      console.log("🆕 created user:", user);
    }

    return user;
  }

}
