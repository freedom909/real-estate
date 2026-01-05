export default function mapOAuthProfileToUserInput(profile) {
  if (!profile) {
    throw new Error("oauthUserMapper: profile is required");
  }

  return {
    email: profile.email,
    name: profile.name,
    avatar: profile.avatar,
    provider: profile.provider,
    providerUserId: profile.id,
  };
}
