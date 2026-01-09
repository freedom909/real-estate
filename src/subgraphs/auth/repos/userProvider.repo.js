import UserProvider from '../models/userProvider.model.js'

export default {
  findByProviderId(provider, providerUserId) {
    return UserProvider.findOne({ provider, providerUserId })
  },

  async create({ userId, provider, providerUserId }) {
    try {
      return await UserProvider.create({
        userId,
        provider,
        providerUserId
      })
    } catch (err) {
      // 并发绑定兜底
      if (err.code === 11000) return null
      throw err
    }
  }
}
