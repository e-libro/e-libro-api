import { jest } from "@jest/globals";
import mongoose from "mongoose";
import { connect, clearDatabase, closeDatabase } from "../dbHandler.js";
import CryptoJS from "crypto-js";
import jwt from "jsonwebtoken";
import User from "../../src/models/UserModel.js";

beforeAll(async () => {
  await connect();
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await closeDatabase();
});

describe("Pruebas para el modelo User", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Debe lanzar un error si el email no es válido", async () => {
    const invalidUser = new User({
      fullname: "Test User",
      email: "invalid-email",
      password: "Password123!",
      role: "user",
    });

    try {
      await invalidUser.validate();
    } catch (error) {
      expect(error.errors.email.message).toBe(
        "invalid-email is not a valid email address!"
      );
    }
  });

  test("Debe encriptar el password antes de guardar", async () => {
    const user = new User({
      fullname: "Test User",
      email: "test@example.com",
      password: "Password123!",
      role: "user",
    });

    await user.save();

    expect(user.password).toBeDefined();
    expect(user.password).not.toBe("Password123!");
    expect(user.salt).toBeDefined();
  });

  test("Debe lanzar un error si el password no cumple con el regex", async () => {
    const invalidPasswordUser = new User({
      fullname: "Test User",
      email: "test@example.com",
      password: "password",
      role: "user",
    });

    try {
      await invalidPasswordUser.validate();
    } catch (error) {
      expect(error.errors.password.message).toBe("Password is required");
    }
  });

  test("Debe generar un token de acceso encriptado", async () => {
    const user = new User({
      fullname: "Test User",
      email: "test@example.com",
      password: "Password123!",
      role: "user",
    });

    jest.spyOn(jwt, "sign");
    const accessToken = user.createAccessToken();

    expect(jwt.sign).toHaveBeenCalled();
    expect(accessToken).toBeDefined();
  });

  test("Debe generar un token de refresco encriptado y guardarlo", async () => {
    const user = new User({
      fullname: "Test User",
      email: "test@example.com",
      password: "Password123!",
      role: "user",
    });

    jest.spyOn(jwt, "sign");
    jest.spyOn(user, "save");

    const refreshToken = await user.createRefreshToken();

    expect(jwt.sign).toHaveBeenCalled();
    expect(refreshToken).toBeDefined();
    expect(user.save).toHaveBeenCalled();
  });

  test("Debe verificar y descifrar un token de acceso", async () => {
    const token = "mockAccessToken";

    jest.spyOn(CryptoJS.AES, "decrypt");
    jest.spyOn(jwt, "verify").mockReturnValue({ user: { id: "12345" } });

    const verified = await User.verifyAccessToken(token);

    expect(CryptoJS.AES.decrypt).toHaveBeenCalled();
    expect(jwt.verify).toHaveBeenCalled();
    expect(verified.user.id).toBe("12345");
  });

  // test("Debe verificar y descifrar un token de refresh", async () => {
  //   const token = "mockRefreshToken";
  //   const userMock = {
  //     findOne: jest.fn().mockResolvedValue({
  //       refreshToken: token,
  //     }),
  //   };

  //   jest.spyOn(mongoose, "model").mockReturnValue(userMock);
  //   jest.spyOn(userMock, "findOne");

  //   const verified = await User.verifyRefreshToken(token);

  //   expect(userMock.findOne).toHaveBeenCalledWith({ refreshToken: token });
  //   expect(verified).toBeDefined();
  // });

  test("Línea 71: Debe lanzar un error si el salt no se genera correctamente", async () => {
    const user = new User({
      fullname: "Test User",
      email: "test@example.com",
      password: "Password123!",
      role: "user",
    });

    jest.spyOn(CryptoJS, "SHA256").mockImplementation(() => {
      throw new Error("Salt generation error");
    });

    await expect(user.save()).rejects.toThrow("Salt generation error");
  });

  // test("Líneas 76-88: Debe encriptar el email y fullname correctamente antes de guardar", async () => {
  //   const user = new User({
  //     fullname: "Test User",
  //     email: "test@example.com",
  //     password: "Password123!",
  //     role: "user",
  //   });

  //   jest.spyOn(CryptoJS.AES, "encrypt");
  //   await user.save();

  //   expect(CryptoJS.AES.encrypt).toHaveBeenCalledWith(
  //     "test@example.com",
  //     expect.any(Object),
  //     expect.any(Object)
  //   );
  //   expect(CryptoJS.AES.encrypt).toHaveBeenCalledWith(
  //     "Test User",
  //     expect.any(String)
  //   );
  // });

  test("Líneas 161-170: Debe lanzar un error al comparar contraseñas incorrectas", () => {
    const user = new User({
      fullname: "Test User",
      email: "test@example.com",
      password: "Password123!",
      salt: "randomSalt",
    });

    jest.spyOn(CryptoJS, "SHA256").mockReturnValue("hashedCandidatePassword");
    user.password = "anotherHashedPassword";

    expect(user.comparePassword("WrongPassword")).toBe(false);
  });

  test("Líneas 180-184: Debe generar un token de acceso encriptado", () => {
    const user = new User({
      fullname: "Test User",
      email: "test@example.com",
      role: "user",
    });

    jest.spyOn(jwt, "sign").mockReturnValue("mockAccessToken");
    jest.spyOn(CryptoJS.AES, "encrypt").mockReturnValue("encryptedAccessToken");

    const token = user.createAccessToken();

    expect(jwt.sign).toHaveBeenCalled();
    expect(CryptoJS.AES.encrypt).toHaveBeenCalledWith(
      "mockAccessToken",
      expect.any(Object),
      expect.any(Object)
    );
    expect(token).toBe("encryptedAccessToken");
  });

  test("Líneas 191-200: Debe generar y guardar un token de refresco encriptado", async () => {
    const user = new User({
      fullname: "Test User",
      email: "test@example.com",
      role: "user",
    });

    jest.spyOn(jwt, "sign").mockReturnValue("mockRefreshToken");
    jest
      .spyOn(CryptoJS.AES, "encrypt")
      .mockReturnValue("encryptedRefreshToken");
    jest.spyOn(user, "save").mockResolvedValue(user);

    const token = await user.createRefreshToken();

    expect(jwt.sign).toHaveBeenCalled();
    expect(CryptoJS.AES.encrypt).toHaveBeenCalledWith(
      "mockRefreshToken",
      expect.any(Object),
      expect.any(Object)
    );
    expect(user.save).toHaveBeenCalled();
    expect(token).toBe("encryptedRefreshToken");
  });

  test("Líneas 216-222: Debe verificar un token de acceso válido", async () => {
    const encryptedToken = "mockEncryptedAccessToken";
    const decryptedToken = "mockDecryptedAccessToken";

    jest
      .spyOn(CryptoJS.AES, "decrypt")
      .mockReturnValue({ toString: () => decryptedToken });
    jest.spyOn(jwt, "verify").mockReturnValue({ user: { id: "12345" } });

    const verified = await User.verifyAccessToken(encryptedToken);

    expect(CryptoJS.AES.decrypt).toHaveBeenCalledWith(
      { ciphertext: expect.any(Object) },
      expect.any(Object),
      expect.any(Object)
    );
    expect(jwt.verify).toHaveBeenCalledWith(decryptedToken, expect.any(String));
    expect(verified.user.id).toBe("12345");
  });

  test("Líneas 272, 277-299: Debe verificar y descifrar un token de refresco válido", async () => {
    const token = "mockEncryptedRefreshToken";
    const decryptedToken = "mockDecryptedRefreshToken";

    jest
      .spyOn(CryptoJS.AES, "decrypt")
      .mockReturnValue({ toString: () => decryptedToken });
    jest.spyOn(jwt, "verify").mockReturnValue({ user: { id: "12345" } });

    const mockFindOne = jest.fn().mockResolvedValue({ refreshToken: token });
    jest.spyOn(mongoose.Model, "findOne").mockImplementation(mockFindOne);

    const verified = await User.verifyRefreshToken(token);

    expect(mockFindOne).toHaveBeenCalledWith({ refreshToken: token });
    expect(CryptoJS.AES.decrypt).toHaveBeenCalledWith(
      { ciphertext: expect.any(Object) },
      expect.any(Object),
      expect.any(Object)
    );
    expect(jwt.verify).toHaveBeenCalledWith(decryptedToken, expect.any(String));
    expect(verified.user.id).toBe("12345");
  });
});
