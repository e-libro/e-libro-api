import jwt from "jsonwebtoken";
import { userService } from "../services/index.js";
import ApiError from "../errors/ApiError.js";

export const verifyToken = async (req, res, next) => {
  try {
    const token =
      req.headers.authorization && req.headers.authorization.split(" ")[1]; // Buscar en el encabezado Authorization

    if (!token) {
      // return res
      //   .status(401)
      //   .json({ errorMessage: "Unauthorized: Token not provided." });
      next(ApiError.Unauthorized("Token not provided"));
    }

    const decoded = await userService.verifyAccessToken(token);
    if (!decoded) {
      // return res
      //   .status(401)
      //   .json({ errorMessage: "Unauthorized: Invalid or expired token." });
      next(ApiError.Unauthorized("Invalid or expired token"));
    }

    const user = await userService.getUserById(decoded.user.id);
    if (!user) {
      // return res.status(404).json({ errorMessage: "User not found." });
      next(ApiError.NotFound("User not found"));
    }

    if (!user.refreshToken) {
      // return res.status(403).json({
      //   errorMessage: "Forbidden: User does not have a valid refresh token.",
      // });
      next(ApiError.Forbidden("User does not have a valid refresh token"));
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      // return res
      //   .status(401)
      //   .json({ errorMessage: "Unauthorized: Token expired." });
      next(ApiError.Unauthorized("Unauthorized: Token expired."));
    }

    // return res
    //   .status(401)
    //   .json({ errorMessage: "Unauthorized: Authentication failed." });
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
