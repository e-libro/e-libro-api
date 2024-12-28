import { jest } from "@jest/globals";
import userService from "../../src/services/userService.js";
import userRepository from "../../src/repositories/userRepository.js";

describe("Pruebas para userService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Debe lanzar un error si faltan campos requeridos al crear un usuario", async () => {
    await expect(
      userService.createUser({ email: "test@example.com" })
    ).rejects.toThrow(
      "Missing required fields: fullname, email, and password are mandatory"
    );
  });

  test("Debe lanzar un error si el email ya está en uso al crear un usuario", async () => {
    const userMock = {
      fullname: "Test User",
      email: "test@example.com",
      password: "Password123!",
    };

    jest.spyOn(userRepository, "findUserByEmail").mockResolvedValue(userMock);

    await expect(userService.createUser(userMock)).rejects.toThrow(
      "The email address is already in use."
    );
  });

  test("Debe crear un usuario si no hay conflictos", async () => {
    const userMock = {
      fullname: "Test User",
      email: "test@example.com",
      password: "Password123!",
    };
    jest.spyOn(userRepository, "findUserByEmail").mockResolvedValue(null);
    jest.spyOn(userRepository, "createUser").mockResolvedValue(userMock);

    const result = await userService.createUser(userMock);

    expect(userRepository.findUserByEmail).toHaveBeenCalledWith(userMock.email);
    expect(userRepository.createUser).toHaveBeenCalledWith(userMock);
    expect(result).toEqual(userMock);
  });

  test("Debe recuperar todos los usuarios", async () => {
    const usersMock = [
      { fullname: "Test User 1", email: "user1@example.com" },
      { fullname: "Test User 2", email: "user2@example.com" },
    ];
    jest.spyOn(userRepository, "findAllUsers").mockResolvedValue(usersMock);

    const result = await userService.getAllUsers();

    expect(userRepository.findAllUsers).toHaveBeenCalled();
    expect(result).toEqual(usersMock);
  });

  test("Debe lanzar un error si falta el email al buscar un usuario por email", async () => {
    await expect(userService.getUserByEmail(null)).rejects.toThrow(
      "Email is required"
    );
  });

  test("Debe lanzar un error si no se encuentra un usuario con el email proporcionado", async () => {
    jest.spyOn(userRepository, "findUserByEmail").mockResolvedValue(null);

    await expect(
      userService.getUserByEmail("test@example.com")
    ).rejects.toThrow("User with email test@example.com not found");
  });

  test("Debe recuperar un usuario por email", async () => {
    const userMock = { fullname: "Test User", email: "test@example.com" };
    jest.spyOn(userRepository, "findUserByEmail").mockResolvedValue(userMock);

    const result = await userService.getUserByEmail("test@example.com");

    expect(userRepository.findUserByEmail).toHaveBeenCalledWith(
      "test@example.com"
    );
    expect(result).toEqual(userMock);
  });

  test("Debe lanzar un error si falta el ID al buscar un usuario por ID", async () => {
    await expect(userService.getUserById(null)).rejects.toThrow(
      "ID is required"
    );
  });

  test("Debe lanzar un error si no se encuentra un usuario con el ID proporcionado", async () => {
    jest.spyOn(userRepository, "findUserById").mockResolvedValue(null);

    await expect(userService.getUserById("12345")).rejects.toThrow(
      "User with ID 12345 not found"
    );
  });

  test("Debe recuperar un usuario por ID", async () => {
    const userMock = { fullname: "Test User", id: "12345" };
    jest.spyOn(userRepository, "findUserById").mockResolvedValue(userMock);

    const result = await userService.getUserById("12345");

    expect(userRepository.findUserById).toHaveBeenCalledWith("12345");
    expect(result).toEqual(userMock);
  });

  test("Debe lanzar un error si faltan el ID o actualizaciones al actualizar un usuario", async () => {
    await expect(userService.updateUser(null, {})).rejects.toThrow(
      "ID and updates are required"
    );
  });

  test("Debe actualizar un usuario si se proporcionan ID y actualizaciones", async () => {
    const updatesMock = { fullname: "Updated User" };
    const updatedUserMock = { id: "12345", fullname: "Updated User" };
    jest.spyOn(userRepository, "updateUser").mockResolvedValue(updatedUserMock);

    const result = await userService.updateUser("12345", updatesMock);

    expect(userRepository.updateUser).toHaveBeenCalledWith(
      "12345",
      updatesMock
    );
    expect(result).toEqual(updatedUserMock);
  });

  test("Debe lanzar un error si falta el ID al eliminar un usuario", async () => {
    await expect(userService.deleteUser(null)).rejects.toThrow(
      "ID is required"
    );
  });

  test("Debe lanzar un error si no se encuentra el usuario al eliminar", async () => {
    jest.spyOn(userRepository, "deleteUser").mockResolvedValue(null);

    await expect(userService.deleteUser("12345")).rejects.toThrow(
      "User with ID 12345 not found"
    );
  });

  test("Debe eliminar un usuario si se proporciona el ID", async () => {
    const deletedUserMock = { id: "12345", fullname: "Deleted User" };
    jest.spyOn(userRepository, "deleteUser").mockResolvedValue(deletedUserMock);

    const result = await userService.deleteUser("12345");

    expect(userRepository.deleteUser).toHaveBeenCalledWith("12345");
    expect(result).toEqual(deletedUserMock);
  });

  test("userExists - should return true if user exists", async () => {
    const email = "test@example.com";

    jest.spyOn(userRepository, "userExists").mockResolvedValue(true);

    const result = await userService.userExists(email);

    expect(userRepository.userExists).toHaveBeenCalledWith(email);
    expect(result).toBe(true);
  });

  test("userExists - should return false if user does not exist", async () => {
    const email = "nonexistent@example.com";

    jest.spyOn(userRepository, "userExists").mockResolvedValue(false);

    const result = await userService.userExists(email);

    expect(userRepository.userExists).toHaveBeenCalledWith(email);
    expect(result).toBe(false);
  });

  test("userExists - should throw error if repository throws error", async () => {
    const email = "test@example.com";

    jest
      .spyOn(userRepository, "userExists")
      .mockRejectedValue(new Error("Failed to check if user exists"));

    await expect(userService.userExists(email)).rejects.toThrow(
      "Failed to check if user exists"
    );
  });

  test("verifyRefreshToken - should return user if token is valid", async () => {
    const token = "validToken";
    const userMock = { id: "123", email: "test@example.com" };

    jest
      .spyOn(userRepository, "verifyRefreshToken")
      .mockResolvedValue(userMock);

    const result = await userService.verifyRefreshToken(token);

    expect(userRepository.verifyRefreshToken).toHaveBeenCalledWith(token);
    expect(result).toEqual(userMock);
  });

  test("verifyRefreshToken - should throw error if token is missing", async () => {
    await expect(userService.verifyRefreshToken(null)).rejects.toThrow(
      "Refresh token is required"
    );
  });

  test("verifyRefreshToken - should throw error if token is invalid", async () => {
    const token = "invalidToken";

    jest.spyOn(userRepository, "verifyRefreshToken").mockResolvedValue(null);

    await expect(userService.verifyRefreshToken(token)).rejects.toThrow(
      "Invalid or expired refresh token"
    );
  });
});
