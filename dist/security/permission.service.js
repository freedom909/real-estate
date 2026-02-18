import { Role } from '@/shared/types/role';
import { ForbiddenError } from '@infrastructure/utils/errors';
export default class PermissionService {
    canAccessUser(requestUser, targetUserId) {
        const isAdmin = requestUser.role === Role.ADMIN;
        const isSelf = requestUser.profile.UserId === targetUserId;
        if (!isAdmin && !isSelf) {
            throw new ForbiddenError('Access denied: Cannot access other users');
        }
    }
}
