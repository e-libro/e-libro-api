import { jest } from "@jest/globals";
import authController from "../../src/controllers/authController.js";
import userService from "../../src/services/userService.js";
import userDTO from "../../src/dtos/userDTO.js";
import ApiError from "../../src/errors/ApiError.js";

describe("AuthController", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("signup", () => {
    test("should create a new user and return success response", async () => {
      const req = {
        body: {
          fullname: "John Doe",
          email: "john@example.com",
          password: "password123",
        },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      const createdUserMock = {
        id: "1",
        fullname: "John Doe",
        email: "john@example.com",
      };
      jest.spyOn(userService, "userExists").mockResolvedValue(false);
      jest.spyOn(userService, "createUser").mockResolvedValue(createdUserMock);
      jest
        .spyOn(userDTO, "mapUserToUserResponseDTO")
        .mockReturnValue(createdUserMock);

      await authController.signup(req, res, next);

      expect(userService.userExists).toHaveBeenCalledWith("john@example.com");
      expect(userService.createUser).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        message: "Signup successful",
        data: createdUserMock,
        error: null,
      });
    });

    test("should call next with ApiError.Conflict if email is already in use", async () => {
      const req = {
        body: {
          fullname: "John Doe",
          email: "john@example.com",
          password: "password123",
        },
      };
      const res = {};
      const next = jest.fn();

      jest.spyOn(userService, "userExists").mockResolvedValue(true);

      await authController.signup(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next.mock.calls[0][0].message).toBe(
        "The email address is already in use."
      );
    });
  });

  describe("signin", () => {
    test("should return accessToken and set refreshToken cookie on success", async () => {
      const req = {
        body: { email: "john@example.com", password: "password123" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        cookie: jest.fn(),
      };
      const next = jest.fn();

      const userMock = {
        email: "john@example.com",
        comparePassword: jest.fn().mockReturnValue(true),
        createAccessToken: jest.fn().mockReturnValue("accessToken"),
        createRefreshToken: jest.fn().mockResolvedValue("refreshToken"),
      };

      jest.spyOn(userService, "getUserByEmail").mockResolvedValue(userMock);

      await authController.signin(req, res, next);

      expect(userService.getUserByEmail).toHaveBeenCalledWith(
        "john@example.com"
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
        status: "success",
        message: "Signin successful",
        data: { accessToken: "accessToken" },
        error: null,
      });
    });
  });

  describe("refresh", () => {
    test("should return new access and refresh tokens on success", async () => {
      const req = { cookies: { jwt: "refreshToken" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        cookie: jest.fn(),
      };
      const next = jest.fn();

      const verifiedToken = { user: { id: "1" } };
      const userMock = {
        id: "1",
        createAccessToken: jest.fn().mockReturnValue("newAccessToken"),
        createRefreshToken: jest.fn().mockResolvedValue("newRefreshToken"),
      };

      jest
        .spyOn(userService, "verifyRefreshToken")
        .mockResolvedValue(verifiedToken);
      jest.spyOn(userService, "getUserById").mockResolvedValue(userMock);

      await authController.refresh(req, res, next);

      expect(userService.verifyRefreshToken).toHaveBeenCalledWith(
        "refreshToken"
      );
      expect(userService.getUserById).toHaveBeenCalledWith("1");
      expect(userMock.createAccessToken).toHaveBeenCalled();
      expect(userMock.createRefreshToken).toHaveBeenCalled();
      expect(res.cookie).toHaveBeenCalledWith(
        "jwt",
        "newRefreshToken",
        expect.any(Object)
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        message: "Refresh successful",
        data: { accessToken: "newAccessToken" },
        error: null,
      });
    });
  });

  describe("signout", () => {
    test("should clear the refresh token cookie and return success", async () => {
      const req = { cookies: { jwt: "refreshToken" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        clearCookie: jest.fn(),
      };
      const next = jest.fn();

      const verifiedToken = { user: { id: "1" } };
      const userMock = {
        id: "1",
        deleteRefreshToken: jest.fn().mockResolvedValue(true),
      };

      jest
        .spyOn(userService, "verifyRefreshToken")
        .mockResolvedValue(verifiedToken);
      jest.spyOn(userService, "getUserById").mockResolvedValue(userMock);

      await authController.signout(req, res, next);

      expect(userService.verifyRefreshToken).toHaveBeenCalledWith(
        "refreshToken"
      );
      expect(userService.getUserById).toHaveBeenCalledWith("1");
      expect(userMock.deleteRefreshToken).toHaveBeenCalled();
      expect(res.clearCookie).toHaveBeenCalledWith("jwt", expect.any(Object));
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        message: "Signout successful",
        data: null,
        error: null,
      });
    });
  });

  describe("getAuthenticatedUser", () => {
    test("should return authenticated user details", async () => {
      const req = {
        user: { id: "1", fullname: "John Doe", email: "john@example.com" },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      const userMock = {
        id: "1",
        fullname: "John Doe",
        email: "john@example.com",
      };
      jest.spyOn(userDTO, "mapUserToUserResponseDTO").mockReturnValue(userMock);

      await authController.getAuthenticatedUser(req, res, next);

      expect(userDTO.mapUserToUserResponseDTO).toHaveBeenCalledWith(req.user);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        message: "Authenticated user retrieved successfully",
        data: userMock,
        error: null,
      });
    });
  });

  describe("changePassword", () => {
    test("should change the password and return success response", async () => {
      const req = {
        body: { currentPassword: "oldPass", newPassword: "newPass" },
        user: {
          comparePassword: jest.fn().mockReturnValue(true),
          save: jest.fn().mockResolvedValue(true),
        },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await authController.changePassword(req, res, next);

      expect(req.user.comparePassword).toHaveBeenCalledWith("oldPass");
      expect(req.user.password).toBe("newPass");
      expect(req.user.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        message: "Password changed successfully",
        data: null,
        error: null,
      });
    });

    test("should call next with ApiError.BadRequest if passwords are missing", async () => {
      const req = { body: {} };
      const res = {};
      const next = jest.fn();

      await authController.changePassword(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Current password and new password are required",
          code: 400,
        })
      );
    });

    test("should call next with ApiError.Unauthorized if user is not authenticated", async () => {
      const req = {
        body: { currentPassword: "oldPass", newPassword: "newPass" },
        user: null,
      };
      const res = {};
      const next = jest.fn();

      await authController.changePassword(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "User is not authenticated",
          code: 401,
        })
      );
    });

    test("should call next with ApiError.Unauthorized if current password is incorrect", async () => {
      const req = {
        body: { currentPassword: "oldPass", newPassword: "newPass" },
        user: {
          comparePassword: jest.fn().mockReturnValue(false),
        },
      };
      const res = {};
      const next = jest.fn();

      await authController.changePassword(req, res, next);

      expect(req.user.comparePassword).toHaveBeenCalledWith("oldPass");
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Current password is incorrect",
          code: 401,
        })
      );
    });
  });

  describe("AuthController - Mobile Authentication", () => {
    let req, res, next;

    beforeEach(() => {
      req = { body: {}, headers: {} };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        sendStatus: jest.fn(),
      };
      next = jest.fn();

      jest.clearAllMocks();
    });

    describe("mobileSignin", () => {
      test("should sign in a user and return access and refresh tokens", async () => {
        req.body = { email: "test@example.com", password: "password123" };
        const userMock = {
          comparePassword: jest.fn().mockReturnValue(true),
          createAccessToken: jest.fn().mockReturnValue("access-token"),
          createRefreshToken: jest.fn().mockResolvedValue("refresh-token"),
        };

        jest.spyOn(userService, "getUserByEmail").mockResolvedValue(userMock);

        await authController.mobileSignin(req, res, next);

        expect(userService.getUserByEmail).toHaveBeenCalledWith(
          "test@example.com"
        );
        expect(userMock.comparePassword).toHaveBeenCalledWith("password123");
        expect(userMock.createAccessToken).toHaveBeenCalled();
        expect(userMock.createRefreshToken).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          status: "success",
          message: "Signin successful",
          data: { accessToken: "access-token", refreshToken: "refresh-token" },
          error: null,
        });
      });

      test("should call next with ApiError.BadRequest if email or password is missing", async () => {
        req.body = { email: "" };

        await authController.mobileSignin(req, res, next);

        expect(next).toHaveBeenCalledWith(
          expect.objectContaining({
            message: "Invalid email or password",
            code: 400,
          })
        );
      });

      test("should call next with ApiError.Unauthorized if user is not found", async () => {
        req.body = { email: "test@example.com", password: "password123" };

        jest.spyOn(userService, "getUserByEmail").mockResolvedValue(null);

        await authController.mobileSignin(req, res, next);

        expect(next).toHaveBeenCalledWith(
          expect.objectContaining({
            message: "Invalid email or password",
            code: 401,
          })
        );
      });

      test("should call next with ApiError.Unauthorized if password is incorrect", async () => {
        req.body = { email: "test@example.com", password: "wrongpassword" };
        const userMock = { comparePassword: jest.fn().mockReturnValue(false) };

        jest.spyOn(userService, "getUserByEmail").mockResolvedValue(userMock);

        await authController.mobileSignin(req, res, next);

        expect(userMock.comparePassword).toHaveBeenCalledWith("wrongpassword");
        expect(next).toHaveBeenCalledWith(
          expect.objectContaining({
            message: "Invalid email or password",
            code: 401,
          })
        );
      });
    });

    describe("mobileRefresh", () => {
      test("should refresh tokens and return new access and refresh tokens", async () => {
        req.headers["x-refresh-token"] = "valid-refresh-token";
        const verifiedTokenMock = { user: { id: "user-id" } };
        const userMock = {
          createAccessToken: jest.fn().mockReturnValue("new-access-token"),
          createRefreshToken: jest.fn().mockResolvedValue("new-refresh-token"),
        };

        jest
          .spyOn(userService, "verifyRefreshToken")
          .mockResolvedValue(verifiedTokenMock);
        jest.spyOn(userService, "getUserById").mockResolvedValue(userMock);

        await authController.mobileRefresh(req, res, next);

        expect(userService.verifyRefreshToken).toHaveBeenCalledWith(
          "valid-refresh-token"
        );
        expect(userService.getUserById).toHaveBeenCalledWith("user-id");
        expect(userMock.createAccessToken).toHaveBeenCalled();
        expect(userMock.createRefreshToken).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          status: "success",
          message: "Refresh successful",
          data: {
            accessToken: "new-access-token",
            refreshToken: "new-refresh-token",
          },
          error: null,
        });
      });

      test("should call next with ApiError.Unauthorized if refresh token is missing", async () => {
        req.headers["x-refresh-token"] = "";

        await authController.mobileRefresh(req, res, next);

        expect(next).toHaveBeenCalledWith(
          expect.objectContaining({
            message: "Refresh token is required",
            code: 401,
          })
        );
      });

      test("should call next with ApiError.Unauthorized if refresh token is invalid", async () => {
        req.headers["x-refresh-token"] = "invalid-refresh-token";

        jest.spyOn(userService, "verifyRefreshToken").mockResolvedValue(null);

        await authController.mobileRefresh(req, res, next);

        expect(next).toHaveBeenCalledWith(
          expect.objectContaining({
            message: "Invalid or expired refresh token",
            code: 401,
          })
        );
      });
    });

    describe("mobileSignout", () => {
      test("should sign out a user and return 204", async () => {
        req.headers["x-refresh-token"] = "valid-refresh-token";
        const verifiedTokenMock = { user: { id: "user-id" } };
        const userMock = {
          deleteRefreshToken: jest.fn().mockResolvedValue(true),
        };

        jest
          .spyOn(userService, "verifyRefreshToken")
          .mockResolvedValue(verifiedTokenMock);
        jest.spyOn(userService, "getUserById").mockResolvedValue(userMock);

        await authController.mobileSignout(req, res, next);

        expect(userService.verifyRefreshToken).toHaveBeenCalledWith(
          "valid-refresh-token"
        );
        expect(userService.getUserById).toHaveBeenCalledWith("user-id");
        expect(userMock.deleteRefreshToken).toHaveBeenCalled();
        expect(res.sendStatus).toHaveBeenCalledWith(204);
      });

      test("should call next with ApiError.NotFound if refresh token is missing", async () => {
        req.headers["x-refresh-token"] = "";

        await authController.mobileSignout(req, res, next);

        expect(next).toHaveBeenCalledWith(
          expect.objectContaining({
            message: "Not Found",
            code: 404,
          })
        );
      });

      test("should call next with ApiError.NotFound if refresh token is invalid", async () => {
        req.headers["x-refresh-token"] = "invalid-refresh-token";

        jest.spyOn(userService, "verifyRefreshToken").mockResolvedValue(null);

        await authController.mobileSignout(req, res, next);

        expect(next).toHaveBeenCalledWith(
          expect.objectContaining({
            message: "Not Found",
            code: 404,
          })
        );
      });
    });
  });
});
