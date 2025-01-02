import { jest } from "@jest/globals";
import userRepository from "../../src/repositories/userRepository.js";
import db from "../../src/models/index.js";

describe("UserRepository", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createUser", () => {
    test("should create a new user", async () => {
      const userMock = { email: "test@example.com", name: "Test User" };

      jest.spyOn(db.User, "create").mockResolvedValue(userMock);

      const result = await userRepository.createUser(userMock);

      expect(db.User.create).toHaveBeenCalledWith(userMock);
      expect(result).toEqual(userMock);
    });
  });

  describe("findAllUsers", () => {
    test("should return a list of users with the given filters", async () => {
      const filters = { role: "user" };
      const sortBy = { name: "asc" };
      const page = 0;
      const limit = 5;

      const usersMock = [
        { id: "1", name: "User One" },
        { id: "2", name: "User Two" },
      ];

      const findMock = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(usersMock),
      };

      jest.spyOn(db.User, "find").mockReturnValue(findMock);

      const result = await userRepository.findAllUsers(
        filters,
        sortBy,
        page,
        limit
      );

      expect(db.User.find).toHaveBeenCalledWith(filters);
      expect(findMock.sort).toHaveBeenCalledWith(sortBy);
      expect(findMock.skip).toHaveBeenCalledWith(page * limit);
      expect(findMock.limit).toHaveBeenCalledWith(limit);
      expect(result).toEqual(usersMock);
    });
  });

  describe("findUserByEmail", () => {
    test("should find a user by email", async () => {
      const email = "test@example.com";
      const userMock = { id: "1", email, name: "Test User" };

      jest.spyOn(db.User, "findOne").mockResolvedValue(userMock);

      const result = await userRepository.findUserByEmail(email);

      expect(db.User.findOne).toHaveBeenCalledWith({ email });
      expect(result).toEqual(userMock);
    });
  });

  describe("findUserById", () => {
    test("should find a user by ID", async () => {
      const id = "60e6f965b4d6c9e529c7f0b3";
      const userMock = { id, name: "Test User" };

      jest.spyOn(db.User, "findById").mockResolvedValue(userMock);

      const result = await userRepository.findUserById(id);

      expect(db.User.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual(userMock);
    });
  });

  describe("updateUser", () => {
    test("should update a user and return the updated document", async () => {
      const userId = "60e6f965b4d6c9e529c7f0b3";
      const updates = { name: "Updated Name" };

      const userMock = {
        _id: userId,
        name: "Original Name",
        save: jest
          .fn()
          .mockResolvedValue({ _id: userId, name: "Updated Name" }),
      };

      const updatedUserMock = {
        _id: userId,
        name: "Updated Name",
      };

      jest
        .spyOn(db.User, "findById")
        .mockImplementationOnce(() => Promise.resolve(userMock))
        .mockImplementationOnce(() => Promise.resolve(updatedUserMock));

      const result = await userRepository.updateUser(userId, updates);

      expect(db.User.findById).toHaveBeenNthCalledWith(1, { _id: userId });

      Object.keys(updates).forEach((key) => {
        expect(userMock[key]).toBe(updates[key]);
      });

      expect(userMock.save).toHaveBeenCalled();
      expect(db.User.findById).toHaveBeenNthCalledWith(2, userId);
      expect(result).toEqual(updatedUserMock);
    });
  });

  describe("deleteUser", () => {
    test("should delete a user by ID and return the deleted user", async () => {
      const userId = "60e6f965b4d6c9e529c7f0b3";
      const deletedUserMock = { id: userId, name: "Deleted User" };

      jest
        .spyOn(db.User, "findByIdAndDelete")
        .mockResolvedValue(deletedUserMock);

      const result = await userRepository.deleteUser(userId);

      expect(db.User.findByIdAndDelete).toHaveBeenCalledWith({ _id: userId });
      expect(result).toEqual(deletedUserMock);
    });
  });

  describe("userExists", () => {
    test("should return true if the user exists", async () => {
      const email = "test@example.com";

      jest.spyOn(db.User, "findOne").mockResolvedValue({ email });

      const result = await userRepository.userExists(email);

      expect(db.User.findOne).toHaveBeenCalledWith({ email });
      expect(result).toBe(true);
    });

    test("should return false if the user does not exist", async () => {
      const email = "nonexistent@example.com";

      jest.spyOn(db.User, "findOne").mockResolvedValue(null);

      const result = await userRepository.userExists(email);

      expect(db.User.findOne).toHaveBeenCalledWith({ email });
      expect(result).toBe(false);
    });
  });

  describe("verifyRefreshToken", () => {
    test("should return user if refresh token is valid", async () => {
      const token = "validRefreshToken";
      const userMock = { id: "1", email: "test@example.com" };

      jest.spyOn(db.User, "verifyRefreshToken").mockResolvedValue(userMock);

      const result = await userRepository.verifyRefreshToken(token);

      expect(db.User.verifyRefreshToken).toHaveBeenCalledWith(token);
      expect(result).toEqual(userMock);
    });

    test("should return null if refresh token is missing", async () => {
      const result = await userRepository.verifyRefreshToken(null);

      expect(result).toBeNull();
    });
  });

  describe("verifyAccessToken", () => {
    test("should return user if access token is valid", async () => {
      const token = "validAccessToken";
      const userMock = { id: "1", email: "test@example.com" };

      jest.spyOn(db.User, "verifyAccessToken").mockResolvedValue(userMock);

      const result = await userRepository.verifyAccessToken(token);

      expect(db.User.verifyAccessToken).toHaveBeenCalledWith(token);
      expect(result).toEqual(userMock);
    });

    test("should return null if access token is missing", async () => {
      const result = await userRepository.verifyAccessToken(null);

      expect(result).toBeNull();
    });
  });

  describe("countUsers", () => {
    test("should return the total count of users matching filters", async () => {
      const filters = { role: "user" };
      const countMock = 10;

      jest.spyOn(db.User, "countDocuments").mockResolvedValue(countMock);

      const result = await userRepository.countUsers(filters);

      expect(db.User.countDocuments).toHaveBeenCalledWith(filters);
      expect(result).toBe(countMock);
    });
  });
});
