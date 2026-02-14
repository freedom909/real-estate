// sessionHeartbeat.js
export default async function sessionHeartbeat({
  sessionRepository,
  userService,
}) {
  const sessions = await sessionRepository.findAll();

  for (const session of sessions) {
    const user = await userService.getUserById(session.userId);

    if (!user) {
      await sessionRepository.delete(session.id);
      continue;
    }

    await sessionRepository.update(session.id, {
      expiresAt: new Date(Date.now() + 1000 * 60 * 5),
    });
  }
}