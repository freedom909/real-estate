import { normalizeRole } from "../domain/normalizeRole";
class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async getUserById(id) {
        const user = await this.userRepository.findById(id);
        if (!user)
            return null;
        user.role = normalizeRole(user.role);
        return user;
    }
}
export default UserService;
