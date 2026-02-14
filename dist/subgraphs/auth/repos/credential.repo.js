// src/subgraphs/auth/repos/credential.repo.ts
export default class CredentialRepo {
    constructor({ CredentialModel }) {
        if (!CredentialModel) {
            throw new Error("CredentialRepo: CredentialModel is required");
        }
        this.Credential = CredentialModel;
    }
    /**
     * Find local credential by email
     */
    async findPasswordByEmail(email, { session } = {}) {
        return this.Credential.findOne({
            email,
            provider: "LOCAL",
        }).session(session || null);
    }
    async findOAuth(provider, providerSub, { session } = {}) {
        return this.findByProviderSub({ provider, providerSub }, { session });
    }
    async createOAuthCredential({ userId, provider, providerUserId, }, { session } = {}) {
        return this.create({
            userId,
            provider,
            providerSub: providerUserId,
            source: "OAUTH_LOGIN",
        }, { session });
    }
    /**
     * Find by provider + sub
     */
    async findByProviderSub({ provider, providerSub }, { session } = {}) {
        return this.Credential.findOne({
            provider,
            providerSub,
        }).session(session || null);
    }
    /**
     * All credentials for user
     */
    async findByUserId(userId, { session } = {}) {
        return this.Credential.find({
            userId,
        }).session(session || null);
    }
    /**
     * Create new credential
     * ⚠️ Relies on DB unique constraints
     */
    async create({ userId, provider, providerSub, email, source = "OAUTH_LOGIN", }, { session } = {}) {
        const doc = new this.Credential({
            userId,
            provider,
            providerSub,
            email,
            source,
            lastLoginAt: new Date(),
        });
        return doc.save({ session });
    }
    /**
     * Delete credential by id
     */
    async deleteById(id, { session } = {}) {
        return this.Credential.deleteOne({ _id: id }, { session });
    }
    /**
     * Update last login timestamp
     */
    async updateLastLogin(id, { session } = {}) {
        return this.Credential.updateOne({ _id: id }, {
            $set: {
                lastLoginAt: new Date(),
            },
        }, { session });
    }
    /**
     * 🔀 Merge: move all credentials
     */
    async reassignUser(fromUserId, toUserId, { session } = {}) {
        return this.Credential.updateMany({ userId: fromUserId }, {
            $set: {
                userId: toUserId,
                source: "MERGE",
            },
        }, { session });
    }
}
