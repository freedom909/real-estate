// src/security/builder/securityEvent.builder.ts
import { randomUUID } from "crypto";
export class SecurityEventBuilder {
    constructor() {
        this.signals = {};
    }
    // 🔥 正确的 create
    static create(action) {
        const builder = new SecurityEventBuilder();
        builder.action = action;
        return builder;
    }
    withActor(actor) {
        this.actor = {
            id: actor.userId,
            role: actor.role,
        };
        return this;
    }
    withContext(context) {
        this.context = context;
        return this;
    }
    withResource(resource) {
        this.resource = resource;
        return this;
    }
    withPayload(payload) {
        this.payload = payload;
        return this;
    }
    withSignals(signals) {
        this.signals = signals;
        return this;
    }
    build() {
        return {
            eventId: `evt_${randomUUID()}`,
            action: this.action,
            timestamp: new Date().toISOString(),
            actor: this.buildActor(this.actor),
            context: this.buildContext(this.context),
            resource: this.buildResource(this.resource),
            payload: this.sanitizePayload(this.payload),
            signals: this.signals,
        };
    }
    // -------- private helpers --------
    buildActor(user) {
        if (!user) {
            return {
                userId: null,
                role: "ANONYMOUS",
                isAuthenticated: false,
            };
        }
        return {
            userId: user.id,
            role: user.role ?? "USER",
            isAuthenticated: true,
        };
    }
    buildContext(context) {
        return {
            ip: context?.ip ?? null,
            userAgent: context?.userAgent ?? null,
            method: context?.method ?? null,
            path: context?.path ?? null,
            payloadSize: context?.payloadSize ?? null,
        };
    }
    buildResource(resource) {
        return {
            type: resource?.type ?? "UNKNOWN",
            id: resource?.id ?? null,
        };
    }
    sanitizePayload(payload) {
        if (!payload)
            return null;
        const clone = JSON.parse(JSON.stringify(payload));
        delete clone.password;
        delete clone.token;
        delete clone.refreshToken;
        return clone;
    }
}
