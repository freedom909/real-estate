// src/subgraphs/auth/container/index.ts
import { createAuthContainer } from "./auth.container.js";
export function buildAuthContext({ req }) {
    const container = createAuthContainer({
        userApi: req.userApi, // Use default infra if not injected
        refreshTokenRepo: req.refreshTokenRepo,
        redis: req.redis, // ContainerParams に必須なため追加
    });
    return {
        container,
        req,
    };
}
