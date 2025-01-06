import jwt from "jsonwebtoken";
import { userService } from "../services/index.js";
import ApiError from "../errors/ApiError.js";

export const verifyToken = async (req, res, next) => {
  try {
    const token =
      req.headers.authorization && req.headers.authorization.split(" ")[1]; // Buscar en el encabezado Authorization

    if (!token) {
      next(ApiError.Unauthorized("Token not provided"));
    }

    const decoded = await userService.verifyAccessToken(token);
    if (!decoded) {
      next(ApiError.Unauthorized("Invalid or expired token"));
    }

    const user = await userService.getUserById(decoded.user.id);
    if (!user) {
      next(ApiError.NotFound("User not found"));
    }

    if (!user.refreshToken) {
      next(ApiError.Forbidden("User does not have a valid refresh token"));
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      next(ApiError.Unauthorized("Unauthorized: Token expired."));
    }

    next(ApiError.Unauthorized("Authentication failed"));
  }
};

export const verifyRole = (roles = []) => {
  return (req, res, next) => {
    try {
      if (!req?.user?.role) {
        next(
          ApiError.Forbidden(
            "You do not have permission to access this resource"
          )
        );
      }

      const hasPermission = roles.some((role) => role === req.user.role);
      if (!hasPermission) {
        next(
          ApiError.Forbidden(
            "You do not have permission to access this resource"
          )
        );
      }

      next();
    } catch (err) {
      console.error("Error in verifyRole middleware:", err.message);
      next(ApiError.InternalServerError("Internal Server Error"));
    }
  };
};
