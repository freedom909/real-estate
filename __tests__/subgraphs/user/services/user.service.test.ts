import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import UserService, { IContext } from '@subgraphs/user/services/user.service';
import UserRepo  from '@subgraphs/user/repos/user.repo';//
import { IUser, Role } from '@subgraphs/user/models/user.model';
import { AuthenticationError, ForbiddenError, UserInputError } from '@infrastructure/utils/errors';

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepo: jest.Mocked<UserRepo>;
  let mockUser: IUser;

  beforeEach(() => {
    mockUserRepo = { //
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      deactivate: jest.fn(),
    } as unknown as jest.Mocked<UserRepo>;

    userService = new UserService(mockUserRepo);

    // ✅ 不要 const
    mockUser = { //
      _id: 'mock-id' as any,
      __v: 0,
      profile: {
        UserId: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        avatar: 'avatar-url'
      },
      role: Role.USER,
      status: 'ACTIVE',
      tokenVersion: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  });

  describe('findById', () => {

    it('should return user data when user exists', async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser);

      const result = await userService.findById('user123', { user: mockUser });//

      expect(result).toEqual(mockUser);
      expect(mockUserRepo.findById).toHaveBeenCalledWith('user123');
    });

    it('should return null when user does not exist', async () => {
      mockUserRepo.findById.mockResolvedValue(null);

      const result = await userService.findById('user123', { user: mockUser });//

      expect(result).toBeNull();
    });

    it('should throw UserInputError when id is invalid', async () => {
      await expect(
        userService.findById('', { user: mockUser })//
      ).rejects.toThrow(UserInputError);
    });

    it('should throw ForbiddenError when non-admin accesses another user', async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser);

      const context: IContext = {
        user: {
          ...mockUser,
          profile: {
            ...mockUser.profile,
            UserId: 'another-user'
          },
          role: Role.USER
        }
      };

      await expect(
        userService.findById('user123', { user: context.user })//
      ).rejects.toThrow(ForbiddenError);
    });

    it('should allow admin to access another user', async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser);

      const admin: IUser = {
        ...mockUser,
        role: Role.ADMIN
      };

      const result = await userService.findById('user123', { user: admin });//

      expect(result).toEqual(mockUser);
    });

    it('should allow user to access own data', async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser);

      const result = await userService.findById('user123', { user: mockUser });//

      expect(result).toEqual(mockUser);
    });

    it('should throw AuthenticationError when no user in context', async () => {
      await expect(
        userService.findById('user123', { user: undefined })//
      ).rejects.toThrow(AuthenticationError);
    });

    it('should throw UserInputError when repository throws error', async () => {
      mockUserRepo.findById.mockRejectedValue(new Error('DB error'));

      await expect(
        userService.findById('user123', { user: mockUser })//
      ).rejects.toThrow(UserInputError);
    });

  });
});
