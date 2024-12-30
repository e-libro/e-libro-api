import db from "../models/index.js";

class UserRepository {
  async createUser(user) {
    try {
      return await db.User.create(user);
    } catch (error) {
      console.error(`Error creating user: ${error}`);
      throw new Error("Failed to create user");
    }
  }

  async findAllUsers(filters, sortBy, page, limit) {
    try {
      return await db.User.find({ filters })
        .sort(sortBy)
        .skip(page * limit)
        .limit(limit)
        .exec();
    } catch (error) {
      console.error(`Error fetching users: ${error}`);
      throw new Error("Failed to fetch users");
    }
  }

  async findUserByEmail(email) {
    try {
      return await db.User.findOne({ email });
    } catch (error) {
      console.error(`Error fetching user: ${error}`);
      throw new Error("Failed to fetch user");
    }
  }

  async findUserById(id) {
    try {
      return await db.User.findById(id);
    } catch (error) {
      console.error(`Error fetching user: ${error}`);
      throw new Error("Failed to fetch user");
    }
  }

  async updateUser(id, updates) {
    try {
      const doc = await db.User.findById(id);

      if (!doc) {
        throw new Error(`User with ID ${id} not found`);
      }

      Object.keys(updates).forEach((update) => {
        doc[update] = updates[update];
      });

      const updatedDoc = await doc.save();
      return await db.User.findById(updatedDoc._id);
    } catch (error) {
      console.error(`Error updating user: ${error}`);
      throw new Error(`User with ID ${id} not found`);
    }
  }

  async deleteUser(id) {
    try {
      const deletedUser = await db.User.findByIdAndDelete({ _id: id });
      if (!deletedUser) {
        throw new Error(`User with ID ${id} not found`);
      }
      return deletedUser;
    } catch (error) {
      console.error(`Error deleting user: ${error}`);
      throw new Error(`User with ID ${id} not found`);
    }
  }

  async userExists(email) {
    try {
      const user = await db.User.findOne({ email });
      return !!user; // Devuelve true si el usuario existe, false si no
    } catch (error) {
      console.error(`Error checking if user exists: ${error.message}`);
      throw new Error("Failed to check if user exists");
    }
  }

  async verifyRefreshToken(token) {
    try {
      if (!token) {
        throw new Error("Refresh token is required");
      }
      const user = await db.User.verifyRefreshToken(token);
      return user;
    } catch (error) {
      console.error(`Error verifying refresh token: ${error.message}`);
      throw new Error("Failed to verify refresh token");
    }
  }

  async verifyAccessToken(token) {
    try {
      if (!token) {
        throw new Error("Access token is required");
      }
      const user = await db.User.verifyAccessToken(token);
      return user;
    } catch (error) {
      console.error(`Error verifying access token: ${error.message}`);
      throw new Error("Failed to verify access token");
    }
  }

  async countUsers(filters) {
    try {
      const total = await db.User.countDocuments(filters);
      return total;
    } catch (error) {
      console.error("Error en countUsers del bookRepository:", error.message);
      throw error;
    }
  }
}

export default new UserRepository();
