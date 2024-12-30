import user from "../models/UserModel.js";

export const verifyRole = (roles = []) => {
  return (req, res, next) => {
    try {
      console.log("verifyRole middleware");
      console.log("Roles permitidos:", roles);
      console.log("Rol del usuario:", req?.user?.role);

      // Verificar si el usuario y el rol existen en la solicitud
      if (!req?.user?.role) {
        return res.status(403).json({
          statusCode: 403,
          message: "Forbidden",
          error: "You do not have permission to access this resource",
        });
      }

      // Verificar si alguno de los roles coincide con el del usuario
      const hasPermission = roles.some((role) => role === req.user.role);
      if (!hasPermission) {
        return res.status(403).json({
          statusCode: 403,
          message: "Forbidden",
          error: "You do not have permission to access this resource",
        });
      }

      // Si pasa las validaciones, continúa con la solicitud
      next();
    } catch (err) {
      console.error("Error in verifyRole middleware:", err.message);
      return res.status(500).json({
        statusCode: 500,
        message: "Internal Server Error",
        error: err.message,
      });
    }
  };
};

export async function verifyToken(req, res, next) {
  if (!req?.headers || !req.headers.authorization)
    return res.status(403).json({ statusCode: 403, message: "Forbidden" });

  const token = req.headers.authorization.split(" ")[1];

  try {
    const decoded = await user.verifyAccessToken(token);

    if (!decoded) {
      return res.status(403).json({ statusCode: 403, message: "Forbidden" });
    }

    const foundUser = await user.findById(decoded.user.id);

    if (!foundUser || !foundUser.refreshToken)
      return res.status(403).json({ statusCode: 403, message: "Forbidden" });

    req.user = foundUser;

    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ statusCode: 401, message: "Unauthorized" });
  }
}
