const users = [
  {
    id: "u1",
    email: "user1@test.com",
    phone: "123456",
    role: "USER",
  },
  {
    id: "a1",
    email: "agent@test.com",
    phone: "999999",
    role: "AGENT",
  },
];

export class UserService {
  getById(id) {
    return users.find((u) => u.id === id) || null;
  }

  getAll() {
    return users;
  }
}
