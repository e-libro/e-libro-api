import { userService } from "../services/index.js";
import { userDTO } from "../dtos/index.js";
import ApiError from "../errors/ApiError.js";
import dotenv from "dotenv";

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
        httpOnly: true,
        sameSite: "Strict",
        secure: true,
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
}

export default new AuthController();
