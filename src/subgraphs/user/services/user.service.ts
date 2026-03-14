import {normalizeRole} from "../../../core/user/domain/normalizeRole";

interface User {
  id: string;
  role: string;
  [key: string]: any;
}

interface UserRepository {
  findById(id: string): Promise<User | null>;
 
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

  // async updateLastLogin(userId: string, lastLoginAt: Date): Promise<{user: User | null}> {

  // const res = await this.userRepository.updateLastLogin(userId, lastLoginAt);

  // return !!res;
}


export default UserService;