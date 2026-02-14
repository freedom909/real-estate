export default class OAuthAccountRepo {
    constructor({ model }) {
        if (!model) {
            throw new Error("OAuthAccountRepo: model is required");
        }
        this.model = model;
    }
    async findByProviderUserId(provider, providerUserId) {
        return this.model
            .findOne({ provider, providerUserId })
            .exec();
    }
    async findByUserId(userId) {
        return this.model
            .find({ userId })
            .exec();
    }
    async create({ userId, provider, providerUserId }) {
        return this.model.create({
            userId,
            provider,
            providerUserId
        });
    }
    async deleteByProvider({ userId, provider }) {
        return this.model.deleteOne({
            userId,
            provider
        });
    }
    async exists(provider, providerUserId) {
        const count = await this.model.countDocuments({
            provider,
            providerUserId
        });
        return count > 0;
    }
}
