/**
 * UserService.findByEmail() Unit Tests
 * 
 * Test Strategy:
 * - Mock all dependencies (UserRepo, PermissionService)
 * - No real database connections
 * - Focus ONLY on findByEmail behavior
 */

import UserService from '../../../subgraphs/user/services/user.service';
import UserRepo from '../../../subgraphs/user/repos/user.repo';
import { IProfile, IUser, Role } from '../../../subgraphs/user/models/user.model';
import { UserInputError } from '../../../infrastructure/utils/errors';
import IPermissionService from '../../../security/permission.service';

// ============================================================================
// Mock Setup - All dependencies are mocked, no real DB/models
// ============================================================================

jest.mock('../../../subgraphs/user/repos/user.repo');

const mockPermissionService = {
  checkPermission: jest.fn(),
  hasRole: jest.fn(),
  authorize: jest.fn(),
} as unknown as jest.Mocked<IPermissionService>;

const mockUserRepo: jest.Mocked<UserRepo> = {
  findById: jest.fn(),
  findByEmail: jest.fn(),
  create: jest.fn(),
  deactivate: jest.fn(),
} as unknown as jest.Mocked<UserRepo>;

// ============================================================================
// Test Suite
// ============================================================================

describe('UserService.findByEmail', () => {
  let userService: UserService;

  // Mock user data factory
  const createMockUser = (overrides?: Partial<IProfile & IUser>): IUser => ({
    _id: 'mock-user-id' as any,
    email: 'test@example.com',
    tokenVersion: 0,
    __v: 0,
    role: Role.USER,
    status: 'ACTIVE',
    profile: {
      UserId: 'mock-profile-id',
      email: 'test@example.com',
      name: 'Test User',
      avatar: 'https://example.com/avatar.png',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create fresh service instance with mocked dependencies
    userService = new UserService( mockUserRepo, mockPermissionService);
  });

  // ============================================================================
  // Category 1: Input Validation
  // ============================================================================
  describe('Input Validation', () => {
    it('should throw UserInputError when email is null', () => {
      const email = null as unknown as string;

      expect(() => userService.findByEmail(email)).rejects.toThrow(UserInputError);
      expect(() => userService.findByEmail(email)).rejects.toThrow('Invalid email');
      
      // Verify repo was never called
      expect(mockUserRepo.findByEmail).not.toHaveBeenCalled();
    });

    it('should throw UserInputError when email is empty string', async () => {
      const email = '';

      await expect(userService.findByEmail(email))
        .rejects
        .toThrow(UserInputError);
      
      await expect(userService.findByEmail(email))
        .rejects
        .toThrow('Invalid email');

      expect(mockUserRepo.findByEmail).not.toHaveBeenCalled();
    });

    it('should throw UserInputError when email format is invalid (no @ symbol)', async () => {
      const email = 'invalid-email';

      await expect(userService.findByEmail(email))
        .rejects
        .toThrow(UserInputError);

      await expect(userService.findByEmail(email))
        .rejects
        .toThrow('Invalid email');

      expect(mockUserRepo.findByEmail).not.toHaveBeenCalled();
    });

    it('should throw UserInputError when email format is invalid (no domain)', async () => {
      const email = 'user@';

      await expect(userService.findByEmail(email))
        .rejects
        .toThrow(UserInputError);

      expect(mockUserRepo.findByEmail).not.toHaveBeenCalled();
    });

    it('should throw UserInputError when email format is invalid (no local part)', async () => {
      const email = '@example.com';

      await expect(userService.findByEmail(email))
        .rejects
        .toThrow(UserInputError);

      expect(mockUserRepo.findByEmail).not.toHaveBeenCalled();
    });

    it('should throw UserInputError when email contains spaces', async () => {
      const email = 'user @example.com';

      await expect(userService.findByEmail(email))
        .rejects
        .toThrow(UserInputError);

      expect(mockUserRepo.findByEmail).not.toHaveBeenCalled();
    });
  });

  // ============================================================================
  // Category 2: User Exists
  // ============================================================================
  describe('User Exists', () => {
    it('should return user when email is valid and user exists', async () => {
      const email = 'valid@example.com';
      const expectedUser = createMockUser({ email });// オブジェクト リテラルは既知のプロパティのみ指定できます。'email' は型 'Partial<IUser>' に存在しません。ts(2353)

      mockUserRepo.findByEmail.mockResolvedValue(expectedUser);

      const result = await userService.findByEmail(email);

      expect(result).toEqual(expectedUser);
      expect(mockUserRepo.findByEmail).toHaveBeenCalledTimes(1);
      expect(mockUserRepo.findByEmail).toHaveBeenCalledWith(email);
    });

    it('should return user with ADMIN role when admin user exists', async () => {
      const email = 'admin@example.com';
      const adminUser = createMockUser({ 
        email, 
        role: Role.ADMIN 
      });
 //型 'IProfile' の引数を型 '(IUser & Required<{ _id: ObjectId; }>) | Query<IUser & Required<{ _id: ObjectId; }>, Document<unknown, {}, IUser, {}, DefaultSchemaOptions> & IUser & Required<...> & { ...; } & { ...; }, {}, IUser, "findOne", {}>' のパラメーターに割り当てることはできません。
      mockUserRepo.findByEmail.mockResolvedValue(adminUser);

      const result = await userService.findByEmail(email);

      expect(result).toEqual(adminUser);
      expect(result?.role).toBe(Role.ADMIN);
    });

    it('should return user with INACTIVE status when inactive user exists', async () => {
      const email = 'inactive@example.com';
      const inactiveUser = createMockUser({ 
        email, 
        status: 'INACTIVE' 
      });

      mockUserRepo.findByEmail.mockResolvedValue(inactiveUser);

      const result = await userService.findByEmail(email);

      expect(result).toEqual(inactiveUser);
      expect(result?.status).toBe('INACTIVE');
    });

    it('should handle multiple calls with same email correctly', async () => {
      const email = 'test@example.com';
      const user = createMockUser({ email });
// 型 'IProfile' の引数を型 '(IUser & Required<{ _id: ObjectId; }>) | Query<IUser & Required<{ _id: ObjectId; }>, Document<unknown, {}, IUser, {}, DefaultSchemaOptions> & IUser & Required<...> & { ...; } & { ...; }, {}, IUser, "findOne", {}>' のパラメーターに割り当てることはできません。
      mockUserRepo.findByEmail.mockResolvedValue(user);

      const result1 = await userService.findByEmail(email);
      const result2 = await userService.findByEmail(email);

      expect(result1).toEqual(user);
      expect(result2).toEqual(user);
      expect(mockUserRepo.findByEmail).toHaveBeenCalledTimes(2);
    });
  });

  // ============================================================================
  // Category 3: User Does Not Exist
  // ============================================================================
  describe('User Does Not Exist', () => {
    it('should return null when email is valid but user does not exist', async () => {
      const email = 'nonexistent@example.com';

      mockUserRepo.findByEmail.mockResolvedValue(null);

      const result = await userService.findByEmail(email);

      expect(result).toBeNull();
      expect(mockUserRepo.findByEmail).toHaveBeenCalledTimes(1);
      expect(mockUserRepo.findByEmail).toHaveBeenCalledWith(email);
    });

    it('should return null for valid email format that has no matching user', async () => {
      const email = 'newuser@example.com';

      mockUserRepo.findByEmail.mockResolvedValue(null);

      const result = await userService.findByEmail(email);

      expect(result).toBeNull();
    });
  });

  // ============================================================================
  // Category 4: Repository Throws Error
  // ============================================================================
  describe('Repository Throws Error', () => {
    it('should throw UserInputError when repo throws generic Error', async () => {
      const email = 'valid@example.com';
      const repoError = new Error('Database connection failed');

      mockUserRepo.findByEmail.mockRejectedValue(repoError);

      await expect(userService.findByEmail(email))
        .rejects
        .toThrow(UserInputError);

      await expect(userService.findByEmail(email))
        .rejects
        .toThrow('Failed to fetch user');
    });

    it('should throw UserInputError when repo throws MongooseError', async () => {
      const email = 'valid@example.com';
      const mongooseError = new Error('Mongoose error');
      (mongooseError as any).name = 'MongooseError';

      mockUserRepo.findByEmail.mockRejectedValue(mongooseError);

      await expect(userService.findByEmail(email))
        .rejects
        .toThrow(UserInputError);

      await expect(userService.findByEmail(email))
        .rejects
        .toThrow('Failed to fetch user');
    });

    it('should throw UserInputError when repo throws string error', async () => {
      const email = 'valid@example.com';

      mockUserRepo.findByEmail.mockRejectedValue('String error');

      await expect(userService.findByEmail(email))
        .rejects
        .toThrow(UserInputError);

      await expect(userService.findByEmail(email))
        .rejects
        .toThrow('Failed to fetch user');
    });

    it('should throw UserInputError when repo throws undefined', async () => {
      const email = 'valid@example.com';

      mockUserRepo.findByEmail.mockRejectedValue(undefined);

      await expect(userService.findByEmail(email))
        .rejects
        .toThrow(UserInputError);
    });

    it('should call repo exactly once before throwing', async () => {
      const email = 'valid@example.com';

      mockUserRepo.findByEmail.mockRejectedValue(new Error('DB error'));

      try {
        await userService.findByEmail(email);
      } catch {
        // Expected
      }

      expect(mockUserRepo.findByEmail).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================================================
  // Category 5: Additional Edge Cases
  // ============================================================================
  describe('Additional Edge Cases', () => {
    it('should handle email with subdomain', async () => {
      const email = 'user@mail.sub.example.com';
      const user = createMockUser({ email });

      mockUserRepo.findByEmail.mockResolvedValue(user);

      const result = await userService.findByEmail(email);

      expect(result).toEqual(user);
    });

    it('should handle email with plus addressing', async () => {
      const email = 'user+tag@example.com';
      const user = createMockUser({ email });

      mockUserRepo.findByEmail.mockResolvedValue(user);

      const result = await userService.findByEmail(email);

      expect(result).toEqual(user);
    });

    it('should handle email with dots in local part', async () => {
      const email = 'user.name@example.com';
      const user = createMockUser({ email });

      mockUserRepo.findByEmail.mockResolvedValue(user);

      const result = await userService.findByEmail(email);

      expect(result).toEqual(user);
    });

    it('should handle uppercase email (if validator allows)', async () => {
      const email = 'USER@EXAMPLE.COM';
      const user = createMockUser({ email });

      mockUserRepo.findByEmail.mockResolvedValue(user);

      const result = await userService.findByEmail(email);

      expect(result).toEqual(user);
    });

    it('should handle very long valid email', async () => {
      const longLocalPart = 'a'.repeat(50);
      const email = `${longLocalPart}@example.com`;
      const user = createMockUser({ email });

      mockUserRepo.findByEmail.mockResolvedValue(user);

      const result = await userService.findByEmail(email);

      expect(result).toEqual(user);
    });
  });

  // ============================================================================
  // Dependency Isolation Verification
  // ============================================================================
  describe('Dependency Isolation', () => {
    it('should not call findById when using findByEmail', async () => {
      const email = 'test@example.com';
      const user = createMockUser({ email });

      mockUserRepo.findByEmail.mockResolvedValue(user);

      await userService.findByEmail(email);

      expect(mockUserRepo.findById).not.toHaveBeenCalled();
    });

    it('should not use real database connection', async () => {
      const email = 'test@example.com';

      // If real DB was used, this would fail or connect to DB
      // Since we mocked, it should use our mock value
      mockUserRepo.findByEmail.mockResolvedValue(null);

      const result = await userService.findByEmail(email);

      expect(result).toBeNull();
      // Verify only mock was called
      expect(mockUserRepo.findByEmail).toHaveBeenCalled();
    });

    it('should create new service instance with mocked dependencies each test', async () => {
      // This test verifies beforeEach properly resets the service
      const email = 'isolation@test.com';
      //型 'IProfile' の引数を型 '(IUser & Required<{ _id: ObjectId; }>) | Query<IUser & Required<{ _id: ObjectId; }>, Document<unknown, {}, IUser, {}, DefaultSchemaOptions> & IUser & Required<...> & { ...; } & { ...; }, {}, IUser, "findOne", {}>' のパラメーターに割り当てることはできません。
      mockUserRepo.findByEmail.mockResolvedValueOnce(createMockUser({ email }));
      mockUserRepo.findByEmail.mockResolvedValueOnce(null);

      const result1 = await userService.findByEmail(email);
      
      // Create new instance to verify isolation
      const newUserService = new UserService(mockUserRepo, mockPermissionService);
      const result2 = await newUserService.findByEmail(email);

      expect(result1).not.toBeNull();
      expect(result2).toBeNull();
    });
  });
});
