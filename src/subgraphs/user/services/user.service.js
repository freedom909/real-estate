export default class UserService {
  constructor( userRepo ) {
    this.userRepo = userRepo;
  }

  async findByEmail(email) {
    return this.userRepo.findByEmail(email);//  "message": "Cannot read properties of undefined (reading 'findByEmail')",
  }

  async findById(id) {
    return this.userRepo.findById(id);
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
