import normalizeRole from "../domain/normalizeRole";

async function getUserById(id) {
  const user = await this.userRepository.findById(id);
  if (!user) return null;

  user.role = normalizeRole(user.role);
  return user;
}
