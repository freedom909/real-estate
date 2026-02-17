import { IUser, Role } from '@subgraphs/user/models/user.model';
import { ForbiddenError } from '@infrastructure/utils/errors';

export interface IPermissionService {
  canAccessUser(requestUser: IUser, targetUserId: string): void;
}

export default class PermissionService implements IPermissionService {

  canAccessUser(requestUser: IUser, targetUserId: string): void {

    const isAdmin = requestUser.role === Role.ADMIN;
    const isSelf = requestUser.profile.UserId === targetUserId;

    if (!isAdmin && !isSelf) {
      throw new ForbiddenError(
        'Access denied: Cannot access other users'
      );
    }
  }
}
