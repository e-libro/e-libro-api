import { userService } from "../services/index.js";
import { userDTO } from "../dtos/index.js";
import ApiError from "../errors/ApiError.js";
import dotenv from "dotenv";

dotenv.config();

class AuthController {
  async signup(req, res, next) {
    try {
      const { fullname, email, password } = req.body;

      if (!fullname || !email || !password) {
        throw ApiError.BadRequest("Fullname, email, and password are required");
      }

      const emailExists = await userService.userExists(email);

      if (emailExists) {
        throw ApiError.Conflict("The email address is already in use.");
      }

      const createdUser = await userService.createUser({
        fullname,
        email,
        password,
      });

      const userResponseDTO = userDTO.mapUserToUserResponseDTO(createdUser);

      return res.status(201).json({
        status: "success",
        message: "Signup successful",
        data: userResponseDTO,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  }

  async signin(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw ApiError.BadRequest("Invalid email or password");
      }

      const user = await userService.getUserByEmail(email);

      if (!user) {
        throw ApiError.Unauthorized("Invalid email or password");
      }

      const match = user.comparePassword(password);

      if (!match) {
        throw ApiError.Unauthorized("Invalid email or password");
      }

      const accessToken = user.createAccessToken();
      const refreshToken = await user.createRefreshToken();

      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        sameSite: "Strict",
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({
        status: "success",
        message: "Signin successful",
        data: { accessToken },
        error: null,
      });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req, res, next) {
    try {
      const refreshToken = req.cookies?.jwt;

      if (!refreshToken) {
        throw ApiError.Unauthorized("Refresh token is required");
      }

      const verifiedToken = await userService.verifyRefreshToken(refreshToken);

      if (!verifiedToken) {
        throw ApiError.Unauthorized("Invalid or expired refresh token");
      }

      const foundUser = await userService.getUserById(verifiedToken.user.id);

      if (!foundUser) {
        throw ApiError.Unauthorized("User not found");
      }

      const newAccessToken = foundUser.createAccessToken();
      const newRefreshToken = await foundUser.createRefreshToken();

      res.cookie("jwt", newRefreshToken, {
        httpOnly: true,
        sameSite: "Strict",
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({
        status: "success",
        message: "Refresh successful",
        data: { accessToken: newAccessToken },
        error: null,
      });
    } catch (error) {
      next(error);
    }
  }

  async signout(req, res, next) {
    try {
      const refreshToken = req.cookies?.jwt;

      if (!refreshToken) {
        throw ApiError.NotFound("Refresh token not found");
      }

      const verifiedToken = await userService.verifyRefreshToken(refreshToken);

      if (!verifiedToken) {
        throw ApiError.NotFound("Invalid refresh token");
      }

      const foundUser = await userService.getUserById(verifiedToken.user.id);

      if (!foundUser) {
        throw ApiError.NotFound("User not found");
      }

      await foundUser.deleteRefreshToken();

      res.clearCookie("jwt", {
        httpOnly: process.env.NODE_ENV === "production" ? true : false,
        sameSite: process.env.NODE_ENV === "production" ? "Strict" : "None",
        secure: process.env.NODE_ENV === "production" ? true : false,
      });

      return res.status(204).json({
        status: "success",
        message: "Signout successful",
        data: null,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAuthenticatedUser(req, res, next) {
    try {
      const authenticatedUser = userDTO.mapUserToUserResponseDTO(req.user);

      if (!authenticatedUser) {
        throw ApiError.Unauthorized("User is not authenticated");
      }

      return res.status(200).json({
        status: "success",
        message: "Authenticated user retrieved successfully",
        data: authenticatedUser,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        throw ApiError.BadRequest(
          "Current password and new password are required"
        );
      }

      const user = req.user; // Asume que `req.user` ya contiene el usuario autenticado (middleware de autenticación).

      if (!user) {
        throw ApiError.Unauthorized("User is not authenticated");
      }

      const isMatch = user.comparePassword(currentPassword);

      if (!isMatch) {
        throw ApiError.Unauthorized("Current password is incorrect");
      }

      user.password = newPassword; // Asegúrate de que el esquema de usuario maneje el hash del password.
      await user.save();

      return res.status(200).json({
        status: "success",
        message: "Password changed successfully",
        data: null,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  }

  async mobileSignin(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw ApiError.BadRequest("Invalid email or password");
      }

      const user = await userService.getUserByEmail(email);

      if (!user) {
        throw ApiError.Unauthorized("Invalid email or password");
      }

      const match = user.comparePassword(password);

      if (!match) {
        throw ApiError.Unauthorized("Invalid email or password");
      }

      const accessToken = user.createAccessToken();
      const refreshToken = await user.createRefreshToken();

      return res.status(200).json({
        status: "success",
        message: "Signin successful",
        data: { accessToken, refreshToken },
        error: null,
      });
    } catch (error) {
      next(error);
    }
  }

  async mobileRefresh(req, res, next) {
    try {
      const refreshToken = req.headers["x-refresh-token"];

      console.log("Mi header personalizado:", refreshToken);

      console.log(refreshToken);

      if (!refreshToken) {
        throw ApiError.Unauthorized("Refresh token is required");
      }

      const verifiedToken = await userService.verifyRefreshToken(refreshToken);

      if (!verifiedToken) {
        throw ApiError.Unauthorized("Invalid or expired refresh token");
      }

      const foundUser = await userService.getUserById(verifiedToken.user.id);

      if (!foundUser) {
        throw ApiError.Unauthorized("User not found");
      }

      const newAccessToken = foundUser.createAccessToken();
      const newRefreshToken = await foundUser.createRefreshToken();

      return res.status(200).json({
        status: "success",
        message: "Refresh successful",
        data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
        error: null,
      });
    } catch (error) {
      next(error);
    }
  }

  async mobileSignout(req, res, next) {
    try {
      const refreshToken = req.headers["x-refresh-token"];

      if (!refreshToken) {
        throw ApiError.NotFound("Refresh token not found");
      }

      const verifiedToken = await userService.verifyRefreshToken(refreshToken);

      if (!verifiedToken) {
        throw ApiError.NotFound("Invalid refresh token");
      }

      const foundUser = await userService.getUserById(verifiedToken.user.id);

      if (!foundUser) {
        throw ApiError.NotFound("User not found");
      }

      await foundUser.deleteRefreshToken();

      return res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
