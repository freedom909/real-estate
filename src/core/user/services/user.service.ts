import {normalizeRole} from "../domain/normalizeRole";

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
}

export default UserService;