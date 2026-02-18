function mapToDomain(doc) {
    return {
        id: doc._id.toString(),
        profile: doc.profile,
        role: doc.role,
        status: doc.status,
        tokenVersion: doc.tokenVersion,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
    };
}
export {};
