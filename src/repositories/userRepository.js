import db from "../models/index.js";

class UserRepository {
  async createUser(user) {
    return await db.User.create(user);
  }

  async findAllUsers(filters, sortBy, page, limit) {
    return await db.User.find(filters)
      .sort(sortBy)
      .skip(page * limit)
      .limit(limit)
      .exec();
  }

  async findUserByEmail(email) {
    return await db.User.findOne({ email });
  }

  async findUserById(id) {
    return await db.User.findById(id);
  }

  async updateUser(userId, updates) {
    if (!userId) return null;

    const doc = await db.User.findById({ _id: userId });

    if (!doc) return null;

    Object.keys(updates).forEach((update) => {
      doc[update] = updates[update];
    });

    const updatedDoc = await doc.save();
    return await db.User.findById(updatedDoc._id);
  }

  async deleteUser(id) {
    const deletedUser = await db.User.findByIdAndDelete({ _id: id });
    if (!deletedUser) return null;
    return deletedUser;
  }

  async userExists(email) {
    const user = await db.User.findOne({ email });
    return !!user;
  }

  async verifyRefreshToken(token) {
    if (!token) return null;
    const user = await db.User.verifyRefreshToken(token);
    return user;
  }

  async verifyAccessToken(token) {
    if (!token) return null;
    const user = await db.User.verifyAccessToken(token);
    return user;
  }

  async countUsers(filters) {
    const total = await db.User.countDocuments(filters);
    return total;
  }
}

export default new UserRepository();
