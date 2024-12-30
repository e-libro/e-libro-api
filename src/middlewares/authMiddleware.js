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
    console.log(req.user);
    next();
  } catch (err) {
    console.error("Error authenticating user:", err);

    // Manejo de errores por tipo
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
