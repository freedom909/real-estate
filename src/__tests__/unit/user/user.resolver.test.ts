import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import resolvers from '../../../subgraphs/user/resolvers/index';
import { TOKENS } from '../../../shared/container/tokens';

// Mock the TOKENS dependency to ensure we control the token values
jest.mock('../../../shared/container/tokens', () => ({
  TOKENS: {
    user: {
      userService: Symbol('mock-user-service-token'),
    },
  },
}));

describe('User Resolvers', () => {
  let mockUserService: any;
  let mockContainer: any;
  let context: any;

  beforeEach(() => {
    // 1. Setup Mock Service
    mockUserService = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      createOAuthUser: jest.fn(),
      deactivate: jest.fn(),
    };

    // 2. Setup Mock Container
    mockContainer = {
      resolve: jest.fn().mockReturnValue(mockUserService),
    };

    // 3. Setup Context
    context = {
      container: mockContainer,
      services: {}, // Some resolvers might use this, though userByEmail uses container
    };

    jest.clearAllMocks();
  });

  describe('Query.userByEmail', () => {
    const userByEmailResolver = resolvers.Query.userByEmail;
    const testEmail = 'test@example.com';

    it('should resolve UserService and call findByEmail with correct arguments', async () => {
      const mockUser = { id: '1', email: testEmail };
      mockUserService.findByEmail.mockResolvedValue(mockUser);

      const result = await userByEmailResolver(
        {}, // parent
        { email: testEmail }, // args
        context // context
      );

      expect(mockContainer.resolve).toHaveBeenCalledWith(TOKENS.user.userService);
      expect(mockUserService.findByEmail).toHaveBeenCalledWith(testEmail);
      expect(result).toEqual(mockUser);
    });

    it('should return null if service returns null (user not found)', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);

      const result = await userByEmailResolver(
        {}, 
        { email: 'nonexistent@example.com' }, 
        context
      );

      expect(result).toBeNull();
    });

    it('should throw error if UserService throws error', async () => {
      const error = new Error('Database connection failed');
      mockUserService.findByEmail.mockRejectedValue(error);

      await expect(userByEmailResolver({}, { email: testEmail }, context))
        .rejects.toThrow('Database connection failed');
    });

    it('should throw error if container fails to resolve service', async () => {
      const error = new Error('Service not bound');
      mockContainer.resolve.mockImplementation(() => { throw error; });

      expect(() => userByEmailResolver({}, { email: testEmail }, context))
        .toThrow('Service not bound');
    });
  });
});
