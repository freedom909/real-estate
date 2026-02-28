import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Types } from 'mongoose';

import UserService, { IContext } from '@/application/user/services/user.service';
import UserRepo from '@subgraphs/user/repos/user.repo';
import { IUserDB } from '@subgraphs/user/models/user.model';
import { Role } from '../../../domain/user/types/role';
import {
  AuthenticationError,
  ForbiddenError,
  UserInputError,
} from '@infrastructure/utils/errors';
import PermissionService, {
  IPermissionService,
} from '../../../security/permission.service';

type IUserDBObject = IUserDB & { _id: Types.ObjectId };

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepo: jest.Mocked<UserRepo>;
  let mockPermissionService: jest.Mocked<IPermissionService>;
  let mockUser: IUserDBObject;

  const createMockUser = (): IUserDBObject=> ({
    _id: new Types.ObjectId(),
    
    profile: {
      userId: 'user123',
      email: 'test@example.com',
      name: 'Test User',
      avatar: 'avatar-url',
    },
    role: Role.CUSTOMER,
    status: 'ACTIVE',
    tokenVersion: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(() => {
    mockUserRepo = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      deactivate: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<UserRepo>;

    mockPermissionService = {
      canAccessUser: jest.fn(),
    } as unknown as jest.Mocked<IPermissionService>;

    userService = new UserService(mockUserRepo, mockPermissionService);

    mockUser = createMockUser();
  });

  // ===============================
  // findByEmail
  // ===============================

  describe('findByEmail', () => {
    it('should return mapped user when exists', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(mockUser);

      const result = await userService.findByEmail(mockUser.profile.email);

      expect(result).not.toBeNull();
      expect(result?.id).toBe(mockUser._id.toString());
      expect(result?.profile.email).toBe(mockUser.profile.email);
      expect(mockUserRepo.findByEmail).toHaveBeenCalledWith(
        mockUser.profile.email
      );
    });

    it('should return null when user does not exist', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);

      const result = await userService.findByEmail('none@example.com');

      expect(result).toBeNull();
    });

    it('should throw UserInputError when email invalid', async () => {
      await expect(
        userService.findByEmail('invalid-email')
      ).rejects.toThrow(UserInputError);

      expect(mockUserRepo.findByEmail).not.toHaveBeenCalled();
    });

    it('should throw UserInputError when repo throws', async () => {
      mockUserRepo.findByEmail.mockRejectedValue(
        new Error('DB error')
      );

      await expect(
        userService.findByEmail(mockUser.profile.email)
      ).rejects.toThrow(UserInputError);
    });
  });

  // ===============================
  // findById
  // ===============================

  describe('findById', () => {
    it('should return user when exists', async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser);

      const result = await userService.findById(
        'some-id',
        { user: mockUser }
      );

      expect(result).toEqual(mockUser);
    });

    it('should return null when not found', async () => {
      mockUserRepo.findById.mockResolvedValue(null);

      const result = await userService.findById(
        'some-id',
        { user: mockUser }
      );

      expect(result).toBeNull();
    });

    it('should throw AuthenticationError if no context user', async () => {
      await expect(
        userService.findById('id', { user: undefined })
      ).rejects.toThrow(AuthenticationError);
    });

    it('should throw UserInputError if id invalid', async () => {
      await expect(
        userService.findById('', { user: mockUser })
      ).rejects.toThrow(UserInputError);
    });

    it('should throw ForbiddenError when non-admin accessing other user', async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser);

      const otherUser: IUserDBObject = {
        ...mockUser,
        profile: {
          ...mockUser.profile,
          userId: 'another-user',
        },
        role: Role.USER,
      };

      await expect(
        userService.findById('id', { user: otherUser })
      ).rejects.toThrow(ForbiddenError);
    });

    it('should allow admin to access other user', async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser);

      const admin: IUserDBObject = {
        ...mockUser,
        role: Role.ADMIN,
      };

      const result = await userService.findById(
        'id',
        { user: admin }
      );

      expect(result).toEqual(mockUser);
    });

    it('should throw UserInputError when repo throws', async () => {
      mockUserRepo.findById.mockRejectedValue(
        new Error('DB error')
      );

      await expect(
        userService.findById('id', { user: mockUser })
      ).rejects.toThrow(UserInputError);
    });
  });

  // ===============================
  // createOAuthUser
  // ===============================

  describe('createOAuthUser', () => {
    const oauthInput = {
      email: 'oauth@example.com',
      profile: {
        id: 'google-123',
        email: 'oauth@example.com',
        name: 'OAuth User',
        picture: 'https://example.com/pic.jpg',
      },
    };

    it('should return existing user (fast path)', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(mockUser);

      const result = await userService.createOAuthUser(oauthInput);

      expect(result).toEqual(mockUser);
      expect(mockUserRepo.create).not.toHaveBeenCalled();
    });

    it('should create new user when not exists', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);
      mockUserRepo.create.mockResolvedValue(mockUser);

      const result = await userService.createOAuthUser(oauthInput);

      expect(result).toEqual(mockUser);
      expect(mockUserRepo.create).toHaveBeenCalledWith({
        role: Role.CUSTOMER,
        status: 'ACTIVE',
        profile: {
          userId: oauthInput.profile.id,
          email: oauthInput.profile.email,
          name: oauthInput.profile.name,
          avatar: oauthInput.profile.picture,
        },
      });
    });

    it('should handle duplicate key (11000)', async () => {
      mockUserRepo.findByEmail
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockUser);

      const duplicateError: any = new Error('Duplicate');
      duplicateError.code = 11000;

      mockUserRepo.create.mockRejectedValue(duplicateError);

      const result = await userService.createOAuthUser(oauthInput);

      expect(result).toEqual(mockUser);
      expect(mockUserRepo.findByEmail).toHaveBeenCalledTimes(2);
    });

    it('should throw if create fails with other error', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);
      mockUserRepo.create.mockRejectedValue(
        new Error('DB crash')
      );

      await expect(
        userService.createOAuthUser(oauthInput)
      ).rejects.toThrow('DB crash');
    });
  });
});


// ===============================
// PermissionService tests
// ===============================

describe('PermissionService', () => {
  const permissionService = new PermissionService();

  const baseUser = {
    profile: { userId: 'user123' },
    role: Role.USER,
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