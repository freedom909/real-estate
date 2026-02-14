import UserProviderModel from "../models/userProvider.model.js";
const UserProviderRepoImpl = {
    findByProviderId(provider, providerUserId) {
        return UserProviderModel
            .findOne({ provider, providerUserId })
            .exec();
    },
    async create({ userId, provider, providerUserId }) {
        try {
            return await UserProviderModel.create({
                userId,
                provider,
                providerUserId
            });
        }
        catch (err) {
            if (err.code === 11000)
                return null;
            throw err;
        }
    }
};
export default UserProviderRepoImpl;
