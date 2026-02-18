export default class UserRepo {
    constructor({ UserModel }) {
        console.log("UserRepo ctor UserModel =", UserModel);
        if (!UserModel)
            throw new Error("UserRepo: UserModel is required"); // "message": "UserService: userRepo is required",
        this.UserModel = UserModel;
    }
    update(id, user) {
        throw new Error("Method not implemented.");
    }
    findByEmail(email) {
        return this.UserModel.findOne({ email }).lean();
    }
    findById(id) {
        return this.UserModel.findById(id).lean();
    }
    async deactivate(id) {
        return await this.UserModel.findByIdAndUpdate(id, { status: "INACTIVE" });
    }
    async create(data) {
        const created = await this.UserModel.create(data);
        return created.toObject();
    }
}
