import { SecurityEventBuilder } from "../builder/securityEvent.builder";
import { GeminiSecurityService } from "../service/geminiSecurity.service";
import { SecurityEventRepository } from "../repo/securityEventRepository";
class SecurityChallengeError extends Error {
    constructor(message) {
        super(message);
        this.name = "SecurityChallengeError";
    }
}
export async function securityMiddleware(ctx, { action, payload }) {
    const event = new SecurityEventBuilder()
        .withActor({ userId: ctx.user?.id ?? "anonymous" })
        .withResource({ type: "user", id: ctx.user?.id ?? "anonymous" })
        .withContext({ ip: ctx.ip, userAgent: ctx.userAgent })
        .withPayload(payload)
        .build();
    // 型 'void' の引数を型 'SecurityEvent' のパラメーターに割り当てることはできません。
    const assessment = await new GeminiSecurityService().assess(event);
    if (assessment.suggestedAction === "FLAG") {
        const securityEventRepository = new SecurityEventRepository();
        //
        await securityEventRepository.save(event, assessment);
    }
    if (assessment.suggestedAction === "CHALLENGE") {
        throw new SecurityChallengeError(assessment.reason || "Security challenge required");
    }
}
