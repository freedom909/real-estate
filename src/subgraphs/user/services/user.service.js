export default class UserService {
  constructor(userRepo) {
    if (!userRepo) {
      throw new Error("UserService: userRepo is required")
    }

    this.userRepo = userRepo
  }
 
 async findByEmail(email) {
  if (!this) throw new Error("this is undefined")
  if (!this.userRepo) throw new Error("userRepo not injected")
  if (!this.userRepo.findByEmail) throw new Error("findByEmail missing")
  return this.userRepo.findByEmail(email)
}

  async findById(id) {
    return this.userRepo.findById(id);// is not a function
  }

 async createOAuthUser({ email, profile }) {
    // 1️⃣ Fast path
    const existing = await this.userRepo.findByEmail(email);
    if (existing) return existing;

    // 2️⃣ Try create
    try {
      return await this.userRepo.create({
        email,
        role: "USER",
        status: "ACTIVE",
        profile,
      });
    } catch (err) {
      // 3️⃣ Handle race condition
      if (err.code === 11000) {
        return await this.userRepo.findByEmail(email);
      }
      throw err;
    }
  }

  async deactivate(userId) {
    await this.userRepo.deactivate(userId);
    return true;
  }
}
