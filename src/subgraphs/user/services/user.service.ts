import {normalizeRole} from "../../../core/user/domain/normalizeRole";

interface User {
  id: string;
  role: string;
  [key: string]: any;
}

interface UserRepository {
  findById(id: string): Promise<User | null>;
  updateLastLogin(userId: string): Promise<boolean>;
}

class UserService {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async getUserById(id: string): Promise<User | null> {
    const user = await this.userRepository.findById(id);
    if (!user) return null;

    user.role = normalizeRole(user.role);
    return user;
  }

  async updateLastLogin(userId: string): Promise<boolean> {

  const res = await this.userRepository.updateLastLogin(userId);

  return !!res;
}
}

export default UserService;