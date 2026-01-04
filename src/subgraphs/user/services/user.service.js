class UserService {
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }

  async findOrCreateByOAuth({
    provider,
    providerUserId,
    email,
  }) {
    // // 1️⃣ 优先用 (provider + providerUserId)
    // let user = await this.userRepository.findByOAuth(
    //   provider,
    //   providerUserId
    // );

    // if (user) return user;

    // // 2️⃣ 没有就创建
    // user = await this.userRepository.create({
    //   provider,
    //   providerUserId,
    //   email,
    //   role: 'USER', // or HOST
    // });

    return this.userRepository.findOrCreateByOAuth(input);
  }
}

export default UserService;


