import { Role } from "@/shared/types/role"; // if this one should move to the 'shared' folder
export default class PolicyEngine {
    can(action, resource, context) {
        const { user, resourceOwnerId } = context;
        if (!user)
            return false;
        // 1️⃣ Admin 全部权限
        if (user.role === Role.ADMIN) {
            return true;
        }
        // 2️⃣ 资源所有权判断
        if (resourceOwnerId && user.id === resourceOwnerId) { //プロパティ 'profile' は型 'PolicyUser' に存在しません。
            return true;
        }
        return false;
    }
}
