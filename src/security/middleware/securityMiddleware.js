export async function securityMiddleware(ctx, { action, payload }) {
  const event = SecurityEventBuilder.build({
    action,
    user: ctx.user,
    ip: ctx.ip,
    userAgent: ctx.userAgent,
    payload,
  })

  const assessment = await geminiSecurityService.assess(event)

  if (assessment.suggestedAction === "FLAG") {
    await securityEventRepo.save(event, assessment)
  }

  if (assessment.suggestedAction === "CHALLENGE") {
    throw new SecurityChallengeError(assessment.reason)
  }
}
