import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { createUserResolvers } from '../../../subgraphs/user/resolvers/user.resolver';

describe('User Resolvers', () => {
  let mockUserService: any;
  let mockPolicyEngine: any;
  let resolvers: any;

  beforeEach(() => {
    mockUserService = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      createOAuthUser: jest.fn(),
      deactivate: jest.fn(),
    };

    mockPolicyEngine = {
      can: jest.fn(),
    };

    // ✅ create resolvers AFTER mocks exist
    resolvers = createUserResolvers();

    jest.clearAllMocks();
  });

  // ===============================
  // Query.userByEmail
  // ===============================
  describe('Query.userByEmail', () => {
    const testEmail = 'test@example.com';

    it('should call findByEmail and return result', async () => {
      const mockUser = { id: '1', email: testEmail };
      mockUserService.findByEmail.mockResolvedValue(mockUser);

      const result = await resolvers.Query.userByEmail(
        {},
        { email: testEmail }
      );

      expect(mockUserService.findByEmail).toHaveBeenCalledWith(testEmail);
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);

      const result = await resolvers.Query.userByEmail(
        {},
        { email: testEmail }
      );

      expect(result).toBeNull();
    });

    it('should propagate errors', async () => {
      const error = new Error('Database connection failed');
      mockUserService.findByEmail.mockRejectedValue(error);

      await expect(
        resolvers.Query.userByEmail({}, { email: testEmail })
      ).rejects.toThrow('Database connection failed');
    });
  });

  // ===============================
  // Mutation.deactivateUser
  // ===============================
  describe('Mutation.deactivateUser', () => {
    const testUserId = 'user-to-deactivate';

    it('should call deactivate and return true', async () => {
      mockUserService.deactivate.mockResolvedValue(true);

      const result = await resolvers.Mutation.deactivateUser(
        {},
        { userId: testUserId }
      );

      expect(mockUserService.deactivate).toHaveBeenCalledWith(testUserId);
      expect(result).toBe(true);
    });

    it('should propagate errors', async () => {
      const errorMessage = 'Repository error: User not found';
      mockUserService.deactivate.mockRejectedValue(new Error(errorMessage));

      await expect(
        resolvers.Mutation.deactivateUser({}, { userId: testUserId })
      ).rejects.toThrow(errorMessage);
    });
  });
});