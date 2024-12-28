import { jest } from "@jest/globals";
import mongoose from "mongoose";
import { connect, clearDatabase, closeDatabase } from "../dbHandler.js";
import User from "../../src/models/UserModel.js";
import userRepository from "../../src/repositories/userRepository.js";

beforeAll(async () => {
  await connect();
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await closeDatabase();
});

describe("User Repository", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockUser = {
    fullname: "Test User",
    email: "test@example.com",
    password: "password123",
  };

  it("Debería crear un usuario", async () => {
    const createdUser = await userRepository.createUser(mockUser);
    expect(createdUser).toBeDefined();
    expect(mongoose.isValidObjectId(createdUser._id)).toBe(true);

    const userInDb = await User.find({ _id: createdUser._id });
    expect(userInDb).toBeDefined();
  });

  it("Debería obtener todos los usuarios", async () => {
    await userRepository.createUser(mockUser);
    await userRepository.createUser({
      ...mockUser,
      email: "test2@example.com",
    });

    const users = await userRepository.findAllUsers();
    expect(users).toHaveLength(2);
  });

  it("Debería encontrar un usuario por email", async () => {
    const createdUser = await userRepository.createUser(mockUser);
    const foundUser = await userRepository.findUserByEmail(mockUser.email);
    expect(createdUser).toBeDefined();
    expect(foundUser).toBeDefined();
    expect(createdUser._id).toStrictEqual(foundUser._id);
  });

  it("Debería actualizar el nombre del usuario", async () => {
    const createdUser = await userRepository.createUser(mockUser);

    expect(createdUser).toBeDefined();
    expect(mongoose.isValidObjectId(createdUser._id)).toBe(true);

    const updates = { fullname: "John Updated" };

    const updatedUser = await userRepository.updateUser(
      createdUser._id,
      updates
    );

    expect(updatedUser).toBeDefined();
    expect(updatedUser.fullname).toBe(updates.fullname);
    expect(updatedUser._id).toStrictEqual(createdUser._id);

    const userInDb = await User.findById(updatedUser._id);
    expect(userInDb).toBeDefined();
    expect(userInDb.fullname).toBe(updates.fullname);
  });

  it("Debería eliminar un usuario por ID", async () => {
    const createdUser = await userRepository.createUser(mockUser);

    expect(createdUser).toBeDefined();
    expect(mongoose.isValidObjectId(createdUser._id)).toBe(true);

    const deletedUser = await userRepository.deleteUser(createdUser._id);

    expect(deletedUser).toBeDefined();
    expect(deletedUser._id.toString()).toBe(createdUser._id.toString());

    const userInDb = await User.findById(createdUser._id);
    expect(userInDb).toBeNull();
  });

  it("Debería fallar si el usuario no existe", async () => {
    const invalidId = new mongoose.Types.ObjectId();

    // Intenta eliminar un usuario con un ID inexistente
    await expect(userRepository.deleteUser(invalidId)).rejects.toThrow(
      `User with ID ${invalidId} not found`
    );
  });

  test("Debe lanzar un error al intentar crear un usuario", async () => {
    const userMock = { name: "Test User", email: "test@example.com" };
    jest.spyOn(User, "create").mockRejectedValue(new Error("Database Error"));

    await expect(userRepository.createUser(userMock)).rejects.toThrow(
      "Failed to create user"
    );
  });

  test("Debe lanzar un error al intentar actualizar un usuario inexistente", async () => {
    const idMock = "12345";
    const updatesMock = { name: "Updated User" };

    jest.spyOn(User, "findById").mockResolvedValue(null);

    await expect(
      userRepository.updateUser(idMock, updatesMock)
    ).rejects.toThrow(`User with ID ${idMock} not found`);

    expect(User.findById).toHaveBeenCalledWith(idMock);
    expect(User.findById).toHaveBeenCalledTimes(1);
  });

  test("Debe lanzar un error al intentar obtener todos los usuarios", async () => {
    jest.spyOn(User, "find").mockRejectedValue(new Error("Database Error"));

    await expect(userRepository.findAllUsers()).rejects.toThrow(
      "Failed to fetch users"
    );
  });

  test("Debe lanzar un error al intentar obtener un usuario por email", async () => {
    const emailMock = "test@example.com";
    jest.spyOn(User, "findOne").mockRejectedValue(new Error("Database Error"));

    await expect(userRepository.findUserByEmail(emailMock)).rejects.toThrow(
      "Failed to fetch user"
    );
  });

  test("Debe lanzar un error al intentar obtener un usuario por ID", async () => {
    const idMock = "12345";
    jest.spyOn(User, "findById").mockRejectedValue(new Error("Database Error"));

    await expect(userRepository.findUserById(idMock)).rejects.toThrow(
      "Failed to fetch user"
    );
  });

  test("Debe lanzar un error al intentar actualizar un usuario y ocurre un problema", async () => {
    const idMock = "12345";
    const updatesMock = { name: "Updated User" };
    const userMock = {
      save: jest.fn().mockRejectedValue(new Error("Save Error")),
    };

    jest.spyOn(User, "findById").mockResolvedValue(userMock);

    await expect(
      userRepository.updateUser(idMock, updatesMock)
    ).rejects.toThrow("User with ID 12345 not found");
  });

  test("Debe lanzar un error al intentar eliminar un usuario inexistente", async () => {
    const idMock = "12345";
    jest.spyOn(User, "findByIdAndDelete").mockResolvedValue(null);

    await expect(userRepository.deleteUser(idMock)).rejects.toThrow(
      `User with ID ${idMock} not found`
    );
  });

  test("userExists - should return true if user exists", async () => {
    const email = "test@example.com";

    jest.spyOn(userRepository, "userExists").mockResolvedValue(true);

    const result = await userRepository.userExists(email);

    expect(userRepository.userExists).toHaveBeenCalledWith(email);
    expect(result).toBe(true);
  });

  test("userExists - should return false if user does not exist", async () => {
    const email = "nonexistent@example.com";

    jest.spyOn(userRepository, "userExists").mockResolvedValue(false);

    const result = await userRepository.userExists(email);

    expect(userRepository.userExists).toHaveBeenCalledWith(email);
    expect(result).toBe(false);
  });

  test("userExists - should throw error on database failure", async () => {
    const email = "test@example.com";

    jest
      .spyOn(userRepository, "userExists")
      .mockRejectedValue(new Error("Database error"));

    await expect(userRepository.userExists(email)).rejects.toThrow(
      "Database error"
    );
  });

  test("verifyRefreshToken - should return user if token is valid", async () => {
    const token = "validToken";
    const userMock = { id: "123", email: "test@example.com" };

    jest.spyOn(User, "verifyRefreshToken").mockResolvedValue(userMock);

    const result = await userRepository.verifyRefreshToken(token);

    expect(User.verifyRefreshToken).toHaveBeenCalledWith(token);
    expect(result).toEqual(userMock);
  });

  test("verifyRefreshToken - should throw error if token is missing", async () => {
    await expect(userRepository.verifyRefreshToken(null)).rejects.toThrow(
      "Failed to verify refresh token"
    );
  });

  test("verifyRefreshToken - should throw error if token verification fails", async () => {
    const token = "invalidToken";

    jest
      .spyOn(User, "verifyRefreshToken")
      .mockRejectedValue(new Error("User not found or invalid token"));

    await expect(userRepository.verifyRefreshToken(token)).rejects.toThrow(
      "Failed to verify refresh token"
    );
  });
});
