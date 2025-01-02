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
    try {
      // Validaciones de parámetros
      if (!filters || typeof filters !== "object") {
        throw new Error("Filters must be a valid object");
      }

      if (!sortBy || typeof sortBy !== "object") {
        throw new Error("SortBy must be a valid object");
      }

      if (typeof page !== "number" || page < 0) {
        throw new Error("Page must be a non-negative number");
      }

      if (typeof limit !== "number" || limit <= 0) {
        throw new Error("Limit must be a positive number");
      }

      // Llamar al repositorio para obtener los usuarios
      const users = await userRepository.findAllUsers(
        filters,
        sortBy,
        page,
        limit
      );

      // Validación de resultado
      if (!users || users.length === 0) {
        throw new Error("No users found with the provided filters");
      }

      return users;
    } catch (error) {
      console.error("Error in UserService.getAllUsers:", error.message);
      throw error;
    }
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

  async getUserById(userId) {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const user = await userRepository.findUserById(userId);

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    return user;
  }

  async updateUser(userId, updates) {
    if (!userId || !updates || Object.keys(updates).length === 0) {
      throw new Error("ID and updates are required");
    }

    return await userRepository.updateUser(userId, updates);
  }

  async deleteUser(userId) {
    if (!userId) {
      throw new Error("ID is required");
    }

    const deletedUser = await userRepository.deleteUser(userId);
    if (!deletedUser) {
      throw new Error(`User with ID ${userId} not found`);
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
        throw new Error("Invalid userId or expired refresh token");
      }
      return user;
    } catch (error) {
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
        throw new Error("Invalid userId or expired access token");
      }
      return user;
    } catch (error) {
      throw error;
    }
  }

  async countUsers(filters) {
    try {
      if (!filters || typeof filters !== "object") {
        throw new Error("Filters must be a valuserId object");
      }

      const totalUsers = await userRepository.countUsers(filters);

      if (totalUsers === null || totalUsers === undefined) {
        throw new Error("Failed to retrieve user count");
      }

      return totalUsers;
    } catch (error) {
      console.error("Error in UserService.countUsers:", error.message);
      throw error;
    }
  }
}

export default new UserService();
