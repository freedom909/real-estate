// src/subgraphs/user/services/user.service.test.ts
import "reflect-metadata";
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import UserService from '../../../application/user/services/user.service';
import UserRepo from '../../../subgraphs/user/repos/user.repo';
import IPermissionService from '../../../security/permission.service';

let mockPermissionService: jest.Mocked<IPermissionService>;
describe('UserService', () => {
  let userService: UserService;
  let mockUserRepo: jest.Mocked<UserRepo>;
  let mockPermissionService: jest.Mocked<IPermissionService>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPermissionService = {} as jest.Mocked<IPermissionService>;
    mockUserRepo = {
      deactivate: jest.fn(),
    } as unknown as jest.Mocked<UserRepo>;

mockPermissionService = {} as jest.Mocked<IPermissionService>;


    userService = new UserService(mockUserRepo, mockPermissionService);
  });

  describe('deactivate', () => {
    const targetUserId = 'user-123-abc';

    it('should successfully deactivate a user and return true', async () => {
      mockUserRepo.deactivate.mockResolvedValue(undefined);

      const result = await userService.deactivate(targetUserId);

      expect(mockUserRepo.deactivate).toHaveBeenCalledTimes(1);
      expect(mockUserRepo.deactivate).toHaveBeenCalledWith(targetUserId);
      expect(result).toBe(true);
    });

    it('should propagate errors when the repository fails', async () => {
      const dbError = new Error('Database connection failed');
      mockUserRepo.deactivate.mockRejectedValue(dbError);

      await expect(
        userService.deactivate(targetUserId)
      ).rejects.toThrow(dbError);

      expect(mockUserRepo.deactivate).toHaveBeenCalledWith(targetUserId);
    });

    it('should pass empty string userId to repository without validation error', async () => {
      const emptyId = '';
      mockUserRepo.deactivate.mockResolvedValue(undefined);

      const result = await userService.deactivate(emptyId);

      expect(mockUserRepo.deactivate).toHaveBeenCalledWith(emptyId);
      expect(result).toBe(true);
    });

    it('should allow whitespace-only userId and pass it to repository', async () => {
      const whitespaceId = '   ';
      mockUserRepo.deactivate.mockResolvedValue(undefined);

      const result = await userService.deactivate(whitespaceId);

      expect(mockUserRepo.deactivate).toHaveBeenCalledWith(whitespaceId);
      expect(result).toBe(true);
    });

    it('should NOT invoke permission service (current behavior)', async () => {
      mockUserRepo.deactivate.mockResolvedValue(undefined);

      await userService.deactivate(targetUserId);

      
    });
  });
});
