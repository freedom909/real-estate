import bcrypt from "bcrypt";

export default class PasswordCredential {
  async verify({ password, passwordHash }) {
    return bcrypt.compare(password, passwordHash);
  }

  async hash(password) {
    return bcrypt.hash(password, 12);
  }
}
