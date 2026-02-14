//import normalizeRole from "../../user/domain/normalizeRole";// モジュール '"d:/real-estate/src/core/user/domain/normalizeRole"' に既定エクスポートがありません。
import { normalizeRole } from "d:/real-estate/src/core/user/domain/normalizeRole"
import RefreshTokenService from './refreshToken.service.js';

interface Profile {
  role: string;
  [key: string]: unknown;
}

interface User {
  profile: Profile;
  role?: string;
  [key: string]: unknown;
}

interface UserRepository {
  findOrCreateOAuthUser(provider: string, token: string): Promise<User>;
}

interface TokenService {
  sign(user: User): string;
}

interface AuthServiceDep {
  userRepository: UserRepository;
  tokenService: TokenService;
  refreshTokenService: RefreshTokenService;
}

interface AuthResult {
  user: User;
  accessToken: string;
}

export default class AuthService {
  private userRepository: UserRepository;
  private tokenService: TokenService;

  constructor({ userRepository, tokenService }: AuthServiceDep) {
    this.userRepository = userRepository;
    this.tokenService = tokenService;
  }

  async oauthLogin(provider: string, token: string): Promise<AuthResult> {
    const user: User = await this.userRepository.findOrCreateOAuthUser(provider, token);
    user.role = (normalizeRole as (role: string) => string)(user.profile.role);

    return {
      user,
      accessToken: this.tokenService.sign(user),
    };
  }
}