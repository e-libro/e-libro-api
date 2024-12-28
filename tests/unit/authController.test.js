import { jest } from "@jest/globals";
import authController from "../../src/controllers/authController.js";
import userService from "../../src/services/userService.js";
import userDTO from "../../src/dtos/userDTO.js";

describe("authController", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("signup", () => {
    test("should return 400 if required fields are missing", async () => {
      const req = {
        body: { email: "test@example.com", password: "password123" },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await authController.signup(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        errorMessage: "Fields are required",
      });
    });

    test("should return 409 if email is already in use", async () => {
      const req = {
        body: {
          fullname: "John Doe",
          email: "test@example.com",
          password: "password123",
        },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      jest.spyOn(userService, "userExists").mockResolvedValue(true);

      await authController.signup(req, res);

      expect(userService.userExists).toHaveBeenCalledWith("test@example.com");
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        errorMessage: "The email address is already in use.",
      });
    });

    test("should return 201 if user is created successfully", async () => {
      const req = {
        body: {
          fullname: "John Doe",
          email: "test@example.com",
          password: "password123",
        },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      const createdUser = {
        id: "123",
        fullname: "John Doe",
        email: "test@example.com",
      };
      const userResponseDTO = {
        id: "123",
        name: "John Doe",
        email: "test@example.com",
      };

      jest.spyOn(userService, "userExists").mockResolvedValue(false);
      jest.spyOn(userService, "createUser").mockResolvedValue(createdUser);
      jest
        .spyOn(userDTO, "mapUserToUserResponseDTO")
        .mockReturnValue(userResponseDTO);

      await authController.signup(req, res);

      expect(userService.userExists).toHaveBeenCalledWith("test@example.com");
      expect(userService.createUser).toHaveBeenCalledWith({
        fullname: "John Doe",
        email: "test@example.com",
        password: "password123",
      });
      expect(userDTO.mapUserToUserResponseDTO).toHaveBeenCalledWith(
        createdUser
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Signup successful",
        user: userResponseDTO,
      });
    });
  });

  describe("signin", () => {
    test("should return 400 if required fields are missing", async () => {
      const req = { body: { email: "" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await authController.signin(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        errorMessage: "Invalid email or password ",
      });
    });

    test("should return 200 if signin is successful", async () => {
      const req = {
        body: { email: "test@example.com", password: "password123" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        cookie: jest.fn(),
      };

      const userMock = {
        id: "123",
        email: "test@example.com",
        comparePassword: jest.fn().mockReturnValue(true),
        createAccessToken: jest.fn().mockReturnValue("accessToken"),
        createRefreshToken: jest.fn().mockResolvedValue("refreshToken"),
      };

      jest.spyOn(userService, "getUserByEmail").mockResolvedValue(userMock);

      await authController.signin(req, res);

      expect(userService.getUserByEmail).toHaveBeenCalledWith(
        "test@example.com"
      );
      expect(userMock.comparePassword).toHaveBeenCalledWith("password123");
      expect(userMock.createAccessToken).toHaveBeenCalled();
      expect(userMock.createRefreshToken).toHaveBeenCalled();
      expect(res.cookie).toHaveBeenCalledWith(
        "jwt",
        "refreshToken",
        expect.any(Object)
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Signin successful",
        accessToken: "accessToken",
      });
    });
  });

  describe("refresh", () => {
    test("should return 401 if refresh token is missing", async () => {
      const req = { cookies: {} };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await authController.refresh(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ errorMessage: "Unauthorized" });
    });

    test("should return 200 with new tokens if refresh is successful", async () => {
      const req = { cookies: { jwt: "refreshToken" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        cookie: jest.fn(),
      };

      const userMock = {
        id: "123",
        email: "test@example.com",
        createAccessToken: jest.fn().mockReturnValue("newAccessToken"),
        createRefreshToken: jest.fn().mockResolvedValue("newRefreshToken"),
      };

      jest
        .spyOn(userService, "verifyRefreshToken")
        .mockResolvedValue({ user: { id: "123" } });
      jest.spyOn(userService, "getUserById").mockResolvedValue(userMock);

      await authController.refresh(req, res);

      expect(userService.verifyRefreshToken).toHaveBeenCalledWith(
        "refreshToken"
      );
      expect(userService.getUserById).toHaveBeenCalledWith("123");
      expect(userMock.createAccessToken).toHaveBeenCalled();
      expect(userMock.createRefreshToken).toHaveBeenCalled();
      expect(res.cookie).toHaveBeenCalledWith(
        "jwt",
        "newRefreshToken",
        expect.any(Object)
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: 200,
        message: "refresh successful",
        accessToken: "newAccessToken",
      });
    });
  });

  describe("signout", () => {
    test("should return 404 if refresh token is missing", async () => {
      const req = { cookies: {} };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await authController.signout(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ errorMessage: "Not Found" });
    });

    test("should return 204 if signout is successful", async () => {
      const req = { cookies: { jwt: "refreshToken" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        clearCookie: jest.fn(),
      };

      const userMock = {
        id: "123",
        deleteRefreshToken: jest.fn().mockResolvedValue(),
      };

      jest
        .spyOn(userService, "verifyRefreshToken")
        .mockResolvedValue({ user: { id: "123" } });
      jest.spyOn(userService, "getUserById").mockResolvedValue(userMock);

      await authController.signout(req, res);

      expect(userService.verifyRefreshToken).toHaveBeenCalledWith(
        "refreshToken"
      );
      expect(userService.getUserById).toHaveBeenCalledWith("123");
      expect(userMock.deleteRefreshToken).toHaveBeenCalled();
      expect(res.clearCookie).toHaveBeenCalledWith("jwt", expect.any(Object));
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.json).toHaveBeenCalledWith({ message: "Signout successful" });
    });
  });
});
