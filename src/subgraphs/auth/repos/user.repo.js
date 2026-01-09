import User from '../models/user.model.js'

export default {
  findById(id) {
    return User.findById(id)
  },

  findByEmail(email) {
    return User.findOne({ email })
  },

  create(data) {
    return User.create({
      email: data.email,
      emailVerified: data.emailVerified ?? true,
      name: data.name,
      avatar: data.avatar
    })
  }
}
