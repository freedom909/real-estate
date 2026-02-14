//cores/user/repos/user.repos.ts
import { User } from "./../domain/user";

export default interface UserRepository {
  findById(id: string): Promise<User | null>;
}