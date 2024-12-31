import jwt from "jsonwebtoken";
import { userService } from "../services/index.js";

export const verifyToken = async (req, res, next) => {
  try {
    const token =
      req.headers.authorization && req.headers.authorization.split(" ")[1]; // Buscar en el encabezado Authorization

    if (!token) {
      return res
        .status(401)
        .json({ errorMessage: "Unauthorized: Token not provided." });
    }

    const decoded = await userService.verifyAccessToken(token);
    if (!decoded) {
      return res
        .status(401)
        .json({ errorMessage: "Unauthorized: Invalid or expired token." });
    }

    const user = await userService.getUserById(decoded.user.id);
    if (!user) {
      return res.status(404).json({ errorMessage: "User not found." });
    }

    if (!user.refreshToken) {
      return res.status(403).json({
        errorMessage: "Forbidden: User does not have a valid refresh token.",
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Error authenticating user:", err);

    if (err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ errorMessage: "Unauthorized: Token expired." });
    }

    return res
      .status(401)
      .json({ errorMessage: "Unauthorized: Authentication failed." });
  }
};

export const verifyRole = (roles = []) => {
  return (req, res, next) => {
    try {
      if (!req?.user?.role) {
        return res.status(403).json({
          statusCode: 403,
          message: "Forbidden",
          error: "You do not have permission to access this resource",
        });
      }

      const hasPermission = roles.some((role) => role === req.user.role);
      if (!hasPermission) {
        return res.status(403).json({
          statusCode: 403,
          message: "Forbidden",
          error: "You do not have permission to access this resource",
        });
      }

      next();
    } catch (err) {
      console.error("Error in verifyRole middleware:", err.message);
      return res.status(500).json({
        errorMessage: "Internal Server Error",
      });
    }
  };
};
