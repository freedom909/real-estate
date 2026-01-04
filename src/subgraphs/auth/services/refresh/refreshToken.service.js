export default class RefreshTokenService {
  constructor({ tokenService, refreshRepo }) {
    this.tokenService = tokenService;
    this.refreshRepo = refreshRepo;
  }

  async issue(user) {
    const accessToken = this.tokenService.issueAccessToken({
      userId: user.id,
      role: user.role,
    });

    const refreshToken = this.tokenService.issueRefreshToken({
      userId: user.id,
    });

    await this.refreshRepo.save({
      userId: user.id,
      token: refreshToken,
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
