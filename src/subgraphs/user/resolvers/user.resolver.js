export default {
  Query: {
  userByEmail: async (_, { email }, { container }) => {
    const userService = container.resolve(TOKENS.user.userService);
    return userService.findByEmail(email);
  },
  },
};