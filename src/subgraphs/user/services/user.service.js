const users = [
  {
    id: "u1",
    email: "user1@test.com",
    phone: "123456",
    role: "USER",
  },
  {
    id: "a1",
    email: "agent@test.com",
    phone: "999999",
    role: "AGENT",
  },
];

export class UserService {
    constructor(userRepository) {
    this.userRepo = userRepository;
  }
  getById(id) {
    return this.userRepo.findById(id);
  }

  getAll() {
    return this.userRepo.findAll();
  }
   async verify({ email, password }) {
    if (!email || !password) {
      throw new GraphQLError('Email and password are required', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }

    const user = await this.userRepository.findOne({ email });
    if (!user) {
      throw new GraphQLError('Invalid email or password', {
        extensions: { code: 'UNAUTHORIZED' },
      });
    }

    const passwordValid = await this.passwordHasher.compare(
      password,
      user.password
    );

    if (!passwordValid) {
      await this.accountLockService.recordFailure(user.id);
      throw new GraphQLError('Invalid email or password', {
        extensions: { code: 'UNAUTHORIZED' },
      });
    }

    return {
      userId: user.id,
      role: user.role,
    };
  }

  async findOrCreateByOAuth({ provider, providerUserId, email }) {
    let user = await this.userRepo.findByOAuth(
      provider,
      providerUserId
    );

    if (user) return user;

    // ⚠️ 同 email 绑定已有账号（可选）
    if (email) {
      user = await this.userRepo.findByEmail(email);
      if (user) {
        return this.userRepo.bindOAuth(user.id, {
          provider,
          providerUserId,
        });
      }
    }

    return this.userRepo.create({
      email,
      role: "USER",
      oauthAccounts: [{ provider, providerUserId }],
    });

  }
}
export default UserService;