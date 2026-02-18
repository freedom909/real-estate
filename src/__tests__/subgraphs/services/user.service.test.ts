import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import UserService, { IContext } from '@subgraphs/user/services/user.service';
import UserRepo from '@subgraphs/user/repos/user.repo';//
import { IUserDB } from '@/subgraphs/user/models/user.model';
import { Role } from '@/shared/types/role';
import { AuthenticationError, ForbiddenError, UserInputError } from '@infrastructure/utils/errors';
import PermissionService, { IPermissionService } from '../../../security/permission.service';

let mockPermissionService: jest.Mocked<IPermissionService>;
describe('UserService', () => {
  let userService: UserService;
  let mockUserRepo: jest.Mocked<UserRepo>;
  let mockUser: IUserDB;

  beforeEach(() => {
    mockUserRepo = { //
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      deactivate: jest.fn(),
    } as unknown as jest.Mocked<UserRepo>;

    mockPermissionService = {
      canAccessUser: jest.fn(),
    } as unknown as jest.Mocked<IPermissionService>;

    userService = new UserService(mockUserRepo, mockPermissionService);

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
      role: Role.CUSTOMER,
      status: 'ACTIVE',
      tokenVersion: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  });

  describe('findByEmail', () => {
    it('should return user data when email is valid and user exists', async () => {
      const email = 'test@example.com';
      mockUserRepo.findByEmail.mockResolvedValue(mockUser);

      const result = await userService.findByEmail(email);

      expect(result).toEqual({
        id: "mock-id",
        profile: mockUser.profile,
        role: mockUser.role,
        status: mockUser.status,
        tokenVersion: mockUser.tokenVersion,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });

      expect(mockUserRepo.findByEmail).toHaveBeenCalledWith(email);
    });

    it('should return null when user does not exist', async () => {
      const email = 'nonexistent@example.com';
      mockUserRepo.findByEmail.mockResolvedValue(null);

      const result = await userService.findByEmail(email);

      expect(result).toBeNull();
      expect(mockUserRepo.findByEmail).toHaveBeenCalledWith(email);
    });

    it('should throw UserInputError when email format is invalid', async () => {
      const invalidEmail = 'invalid-email-format';

      await expect(userService.findByEmail(invalidEmail)).rejects.toThrow(UserInputError);
      await expect(userService.findByEmail(invalidEmail)).rejects.toThrow('Invalid email');
      expect(mockUserRepo.findByEmail).not.toHaveBeenCalled();
    });

    it('should throw UserInputError when repository throws an error', async () => {
      const email = 'test@example.com';
      mockUserRepo.findByEmail.mockRejectedValue(new Error('Database connection failed'));

      await expect(userService.findByEmail(email)).rejects.toThrow(UserInputError);
      await expect(userService.findByEmail(email)).rejects.toThrow('Failed to fetch user');
    });
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

      const admin: IUserDB = {
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

  describe('createOAuthUser', () => {
    const oauthInput = {
      email: 'oauth@example.com',
      profile: {
        id: 'google-123',
        email: 'oauth@example.com',
        name: 'OAuth User',
        picture: 'https://example.com/pic.jpg'
      }
    };

    it('should return existing user if email already exists (Fast Path)', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(mockUser);

      const result = await userService.createOAuthUser(oauthInput);

      expect(result).toEqual(mockUser);
      expect(mockUserRepo.findByEmail).toHaveBeenCalledWith(oauthInput.email);
      expect(mockUserRepo.create).not.toHaveBeenCalled();
    });

    it('should create and return new user if user does not exist', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);
      mockUserRepo.create.mockResolvedValue(mockUser);

      const result = await userService.createOAuthUser(oauthInput);

      expect(result).toEqual(mockUser);
      expect(mockUserRepo.findByEmail).toHaveBeenCalledWith(oauthInput.email);
      expect(mockUserRepo.create).toHaveBeenCalledWith({
        role: Role.CUSTOMER,
        status: 'ACTIVE',
        profile: {
          UserId: oauthInput.profile.id,
          email: oauthInput.profile.email,
          name: oauthInput.profile.name,
          avatar: oauthInput.profile.picture,
        },
      });
    });

    it('should handle race condition (Duplicate Key 11000) by fetching user again', async () => {
      // 1. First find returns null (user doesn't exist yet)
      mockUserRepo.findByEmail.mockResolvedValueOnce(null);

      // 2. Create throws Duplicate Key error (simulating race condition)
      const duplicateError: any = new Error('Duplicate key');
      duplicateError.code = 11000;
      mockUserRepo.create.mockRejectedValue(duplicateError);

      // 3. Second find returns the user (created by another process)
      mockUserRepo.findByEmail.mockResolvedValueOnce(mockUser);

      const result = await userService.createOAuthUser(oauthInput);

      expect(result).toEqual(mockUser);
      expect(mockUserRepo.create).toHaveBeenCalledTimes(1);
      expect(mockUserRepo.findByEmail).toHaveBeenCalledTimes(2);
    });

    it('should throw error if create fails with non-duplicate error', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);
      const dbError = new Error('Database connection failed');
      mockUserRepo.create.mockRejectedValue(dbError);

      await expect(userService.createOAuthUser(oauthInput)).rejects.toThrow('Database connection failed');
    });

    it('should throw error if initial findByEmail fails', async () => {
      mockUserRepo.findByEmail.mockRejectedValue(new Error('Network error'));

      await expect(userService.createOAuthUser(oauthInput)).rejects.toThrow('Network error');
    });
  });
});

describe('PermissionService', () => {

  const permissionService = new PermissionService();

  const baseUser = {
    profile: { UserId: 'user123' },
    role: Role.USER
  } as any;

  it('should allow admin', () => {
    const admin = { ...baseUser, role: Role.ADMIN };
    expect(() =>
      permissionService.canAccessUser(admin, 'another')
    ).not.toThrow();
  });

  it('should allow self', () => {
    expect(() =>
      permissionService.canAccessUser(baseUser, 'user123')
    ).not.toThrow();
  });

  it('should throw ForbiddenError otherwise', () => {
    expect(() =>
      permissionService.canAccessUser(baseUser, 'another')
    ).toThrow(ForbiddenError);
  });
});
