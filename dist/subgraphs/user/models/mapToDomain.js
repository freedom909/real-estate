export function mapToDomain(user) {
    return {
        id: user._id.toString(),
        profile: {
            UserId: user.profile.UserId,
            email: user.profile.email,
            name: user.profile.name,
            avatar: user.profile.avatar,
        },
        role: user.role,
        status: user.status,
        tokenVersion: user.tokenVersion,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
}
