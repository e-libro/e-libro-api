import { jest } from "@jest/globals";
import userService from "../../src/services/userService.js";
import userRepository from "../../src/repositories/userRepository.js";

describe("UserService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createUser", () => {
    test("should create a new user", async () => {
      const userMock = {
        fullname: "Test User",
        email: "test@example.com",
        password: "password123",
      };
      jest.spyOn(userRepository, "findUserByEmail").mockResolvedValue(null);
      jest.spyOn(userRepository, "createUser").mockResolvedValue(userMock);

      const result = await userService.createUser(userMock);

      expect(userRepository.findUserByEmail).toHaveBeenCalledWith(
        userMock.email
      );
      expect(userRepository.createUser).toHaveBeenCalledWith(userMock);
      expect(result).toEqual(userMock);
    });

    test("should throw an error if email is already in use", async () => {
      const userMock = {
        fullname: "Test User",
        email: "test@example.com",
        password: "password123",
      };
      jest.spyOn(userRepository, "findUserByEmail").mockResolvedValue(userMock);

      await expect(userService.createUser(userMock)).rejects.toThrow(
        "The email address is already in use."
      );
    });

    test("should throw an error if required fields are missing", async () => {
      const userMock = { fullname: "", email: "", password: "" };

      await expect(userService.createUser(userMock)).rejects.toThrow(
        "Missing required fields: fullname, email, and password are mandatory"
      );
    });
  });

  describe("getAllUsers", () => {
    test("should return a list of users if successful", async () => {
      const filters = { role: "user" };
      const sortBy = { name: "asc" };
      const page = 0;
      const limit = 5;
      const usersMock = [
        { id: "1", name: "User One" },
        { id: "2", name: "User Two" },
      ];

      jest.spyOn(userRepository, "findAllUsers").mockResolvedValue(usersMock);

      const result = await userService.getAllUsers(
        filters,
        sortBy,
        page,
        limit
      );

      expect(userRepository.findAllUsers).toHaveBeenCalledWith(
        filters,
        sortBy,
        page,
        limit
      );
      expect(result).toEqual(usersMock);
    });

    test("should throw an error if no users are found", async () => {
      const filters = { role: "user" };
      const sortBy = { name: "asc" };
      const page = 0;
      const limit = 5;

      jest.spyOn(userRepository, "findAllUsers").mockResolvedValue([]);

      await expect(
        userService.getAllUsers(filters, sortBy, page, limit)
      ).rejects.toThrow("No users found with the provided filters");
    });
  });

  describe("getUserByEmail", () => {
    test("should return a user by email", async () => {
      const email = "test@example.com";
      const userMock = { id: "1", email, name: "Test User" };

      jest.spyOn(userRepository, "findUserByEmail").mockResolvedValue(userMock);

      const result = await userService.getUserByEmail(email);

      expect(userRepository.findUserByEmail).toHaveBeenCalledWith(email);
      expect(result).toEqual(userMock);
    });

    test("should throw an error if user is not found", async () => {
      const email = "test@example.com";

      jest.spyOn(userRepository, "findUserByEmail").mockResolvedValue(null);

      await expect(userService.getUserByEmail(email)).rejects.toThrow(
        `User with email ${email} not found`
      );
    });
  });

  describe("getUserById", () => {
    test("should return a user by ID", async () => {
      const userId = "60e6f965b4d6c9e529c7f0b3";
      const userMock = { id: userId, name: "Test User" };

      jest.spyOn(userRepository, "findUserById").mockResolvedValue(userMock);

      const result = await userService.getUserById(userId);

      expect(userRepository.findUserById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(userMock);
    });

    test("should throw an error if user is not found", async () => {
      const userId = "60e6f965b4d6c9e529c7f0b3";

      jest.spyOn(userRepository, "findUserById").mockResolvedValue(null);

      await expect(userService.getUserById(userId)).rejects.toThrow(
        `User with ID ${userId} not found`
      );
    });
  });

  describe("updateUser", () => {
    test("should update a user and return the updated document", async () => {
      const userId = "60e6f965b4d6c9e529c7f0b3";
      const updates = { name: "Updated Name" };
      const updatedUserMock = { id: userId, name: "Updated Name" };

      jest
        .spyOn(userRepository, "updateUser")
        .mockResolvedValue(updatedUserMock);

      const result = await userService.updateUser(userId, updates);

      expect(userRepository.updateUser).toHaveBeenCalledWith(userId, updates);
      expect(result).toEqual(updatedUserMock);
    });
  });

  describe("deleteUser", () => {
    test("should delete a user and return the deleted document", async () => {
      const userId = "60e6f965b4d6c9e529c7f0b3";
      const deletedUserMock = { id: userId, name: "Deleted User" };

      jest
        .spyOn(userRepository, "deleteUser")
        .mockResolvedValue(deletedUserMock);

      const result = await userService.deleteUser(userId);

      expect(userRepository.deleteUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual(deletedUserMock);
    });

    test("should throw an error if user is not found", async () => {
      const userId = "60e6f965b4d6c9e529c7f0b3";

      jest.spyOn(userRepository, "deleteUser").mockResolvedValue(null);

      await expect(userService.deleteUser(userId)).rejects.toThrow(
        `User with ID ${userId} not found`
      );
    });
  });

  describe("userExists", () => {
    test("should return true if user exists", async () => {
      const email = "test@example.com";

      jest.spyOn(userRepository, "userExists").mockResolvedValue(true);

      const result = await userService.userExists(email);

      expect(userRepository.userExists).toHaveBeenCalledWith(email);
      expect(result).toBe(true);
    });

    test("should return false if user does not exist", async () => {
      const email = "test@example.com";

      jest.spyOn(userRepository, "userExists").mockResolvedValue(false);

      const result = await userService.userExists(email);

      expect(userRepository.userExists).toHaveBeenCalledWith(email);
      expect(result).toBe(false);
    });
  });

  describe("verifyRefreshToken", () => {
    test("should return user if refresh token is valid", async () => {
      const token = "validRefreshToken";
      const userMock = { id: "1", email: "test@example.com" };

      jest
        .spyOn(userRepository, "verifyRefreshToken")
        .mockResolvedValue(userMock);

      const result = await userService.verifyRefreshToken(token);

      expect(userRepository.verifyRefreshToken).toHaveBeenCalledWith(token);
      expect(result).toEqual(userMock);
    });

    test("should throw an error if token is invalid", async () => {
      const token = "invalidToken";

      jest.spyOn(userRepository, "verifyRefreshToken").mockResolvedValue(null);

      await expect(userService.verifyRefreshToken(token)).rejects.toThrow(
        "InvaluserId or expired refresh token"
      );
    });
  });

  describe("countUsers", () => {
    test("should return the total count of users", async () => {
      const filters = { role: "user" };
      const countMock = 10;

      jest.spyOn(userRepository, "countUsers").mockResolvedValue(countMock);

      const result = await userService.countUsers(filters);

      expect(userRepository.countUsers).toHaveBeenCalledWith(filters);
      expect(result).toBe(countMock);
    });

    test("should throw an error if filters are not valid", async () => {
      await expect(userService.countUsers(null)).rejects.toThrow(
        "Filters must be a valuserId object"
      );
    });

    test("should throw an error if repository returns null", async () => {
      const filters = { role: "user" };

      jest.spyOn(userRepository, "countUsers").mockResolvedValue(null);

      await expect(userService.countUsers(filters)).rejects.toThrow(
        "Failed to retrieve user count"
      );
    });

    test("should throw an error if repository throws an error", async () => {
      const filters = { role: "user" };

      jest
        .spyOn(userRepository, "countUsers")
        .mockRejectedValue(new Error("Repository error"));

      await expect(userService.countUsers(filters)).rejects.toThrow(
        "Repository error"
      );
    });
  });
});
