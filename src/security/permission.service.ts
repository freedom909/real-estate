import { IUserDB } from '@/subgraphs/user/models/user.model';
import { Role } from '@/shared/types/role';
import { ForbiddenError } from '@infrastructure/utils/errors';

export interface IPermissionService {
  canAccessUser(requestUser: IUserDB, targetUserId: string): void;
}

export default class PermissionService implements IPermissionService {

  canAccessUser(requestUser: IUserDB, targetUserId: string): void {

    const isAdmin = requestUser.role === Role.ADMIN;
    const isSelf = requestUser.profile.UserId === targetUserId;

    if (!isAdmin && !isSelf) {
      throw new ForbiddenError(
        'Access denied: Cannot access other users'
      );
    }
  }
}
