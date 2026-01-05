export default class InProcessUserClient {
  constructor({ userService }) {
    this.userService = userService;
  }

  async findUserByEmail(email) {
    if (!email) {
      throw new Error("InProcessUserClient.findUserByEmail: email is required");
    }

    return this.userService.findByEmail(email);
  }
}
