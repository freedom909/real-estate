import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import resolvers from '../../../subgraphs/user/resolvers/user.resolver';
import { TOKENS } from '../../../shared/container/tokens';

// Mock the TOKENS dependency to ensure we control the token values
jest.mock('../../../shared/container/tokens', () => ({
  TOKENS: {
    user: {
      userService: Symbol('mock-user-service-token'),
    },
    security: {
      policyEngine: Symbol('mock-policy-engine-token'),
    }
  },
}));

describe('User Resolvers', () => {
  let mockUserService: any;
  let mockContainer: any;
  let context: any;
  let mockPolicyEngine: any;

  beforeEach(() => {
    // 1. Setup Mock Service
    mockUserService = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      createOAuthUser: jest.fn(),
      deactivate: jest.fn(),
    };

    mockPolicyEngine = {
      can: jest.fn(),
    };

    // 2. Setup Mock Container
    mockContainer = {
      resolve: jest.fn((token) => {
        if (token === TOKENS.user.userService) return mockUserService;
        if (token === TOKENS.security.policyEngine) return mockPolicyEngine;
      }),
    };

    // 3. Setup Context
    context = {
      container: mockContainer,
      services: { userService: mockUserService },
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

  describe('Mutation.deactivateUser', () => {
    const deactivateUserResolver = resolvers.Mutation.deactivateUser;
    const testUserId = 'user-to-deactivate';

    it('should call userService.deactivate with the correct userId and return true on success', async () => {
      mockUserService.deactivate.mockResolvedValue(true);

      const result = await deactivateUserResolver(
        {}, // parent
        { userId: testUserId }, // args
        context // context
      );

      expect(mockUserService.deactivate).toHaveBeenCalledWith(testUserId);
      expect(result).toBe(true);
    });

    it('should propagate errors from userService.deactivate', async () => {
      const errorMessage = 'Repository error: User not found';
      mockUserService.deactivate.mockRejectedValue(new Error(errorMessage));

      await expect(
        deactivateUserResolver({}, { userId: testUserId }, context)
      ).rejects.toThrow(errorMessage);

      expect(mockUserService.deactivate).toHaveBeenCalledWith(testUserId);
    });

    it('should throw an error if context.services is not provided', async () => {
      const contextWithoutServices = { ...context, services: undefined };
      await expect(
        deactivateUserResolver({}, { userId: testUserId }, contextWithoutServices)
      ).rejects.toThrow('Services not found in context');
    });

    it('should throw a TypeError if context.services.userService is not provided', async () => {
      const contextWithoutUserService = { ...context, services: { userService: undefined } };
      await expect(
        deactivateUserResolver({}, { userId: testUserId }, contextWithoutUserService)
      ).rejects.toThrow(TypeError); // Cannot read properties of undefined (reading 'deactivate')
    });

    it('should throw a TypeError if deactivate method does not exist on userService', async () => {
      const contextWithInvalidService = { ...context, services: { userService: {} } };
      await expect(
        deactivateUserResolver({}, { userId: testUserId }, contextWithInvalidService)
      ).rejects.toThrow(TypeError); // services.userService.deactivate is not a function
    });

  });
});
