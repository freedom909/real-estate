// src/security/builder/securityEvent.builder.js
  // ...
import { randomUUID } from "crypto"

export class SecurityEventBuilder {
  static build({
    action,
    actor,
    context,
    resource,
    payload,
    signals = {},
  }) {
    if (!action) {
      throw new Error("SecurityEvent requires action")
    }

    return {
      eventId: this.#generateEventId(),
      action,
      timestamp: new Date().toISOString(),
      actor: this.#buildActor(actor),
      context: this.#buildContext(context),
      resource: this.#buildResource(resource),
      payload: this.#sanitizePayload(payload),
      signals,
    }
  }

  // ---------------- private helpers ----------------

  static #generateEventId() {
    return `evt_${randomUUID()}`
  }

  static #buildActor(user) {
    if (!user) {
      return {
        userId: null,
        role: "ANONYMOUS",
        isAuthenticated: false,
      }
    }

    return {
      userId: user.id,
      role: user.role ?? "USER",
      isAuthenticated: true,
    }
  }

  static #buildContext(context = {}) {
    return {
      ip: context.ip ?? null,
      userAgent: context.userAgent ?? null,
      requestId: context.requestId ?? null,
    }
  }

  static #buildResource(resource = {}) {
    return {
      type: resource.type ?? "UNKNOWN",
      id: resource.id ?? null,
    }
  }

  static #sanitizePayload(payload) {
    if (!payload) return null

    // 防止把 password / token 直接送进 AI
    const clone = JSON.parse(JSON.stringify(payload))

    delete clone.password
    delete clone.token
    delete clone.refreshToken

    return clone
  }
}

