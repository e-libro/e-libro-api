import { userRepository } from "../repositories/index.js";

class UserService {
  async createUser(user) {
    if (!user.email || !user.password || !user.fullname) {
      throw new Error(
        "Missing required fields: fullname, email, and password are mandatory"
      );
    }

    const existingUser = await userRepository.findUserByEmail(user.email);
    if (existingUser) {
      throw new Error("The email address is already in use.");
    }

    return await userRepository.createUser(user);
  }

  async getAllUsers(filters, sortBy, page, limit) {
    return await userRepository.findAllUsers(filters, sortBy, page, limit);
  }

  async getUserByEmail(email) {
    if (!email) {
      throw new Error("Email is required");
    }

    const user = await userRepository.findUserByEmail(email);

    if (!user) {
      throw new Error(`User with email ${email} not found`);
    }

    return user;
  }

  async getUserById(id) {
    if (!id) {
      throw new Error("ID is required");
    }

    const user = await userRepository.findUserById(id);

    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }

    return user;
  }

  async updateUser(id, updates) {
    if (!id || !updates || Object.keys(updates).length === 0) {
      throw new Error("ID and updates are required");
    }

    return await userRepository.updateUser(id, updates);
  }

  async deleteUser(id) {
    if (!id) {
      throw new Error("ID is required");
    }

    // Elimina el usuario por ID
    const deletedUser = await userRepository.deleteUser(id);
    if (!deletedUser) {
      throw new Error(`User with ID ${id} not found`);
    }

    return deletedUser;
  }

  async userExists(email) {
    try {
      if (!email) {
        throw new Error("Email is required");
      }

      const exists = await userRepository.userExists(email);
      return exists;
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
      const user = await userRepository.verifyRefreshToken(token);
      if (!user) {
        throw new Error("Invalid or expired refresh token");
      }
      return user;
    } catch (error) {
      console.error(
        `Error in UserService.verifyRefreshToken: ${error.message}`
      );
      throw error;
    }
  }

  async verifyAccessToken(token) {
    try {
      if (!token) {
        throw new Error("Access token is required");
      }
      const user = await userRepository.verifyAccessToken(token);
      if (!user) {
        throw new Error("Invalid or expired access token");
      }
      return user;
    } catch (error) {
      console.error(`Error in UserService.verifyAccessToken: ${error.message}`);
      throw error;
    }
  }

  async countUsers(filters) {
    return await userRepository.countUsers(filters);
  }
}

export default new UserService();
