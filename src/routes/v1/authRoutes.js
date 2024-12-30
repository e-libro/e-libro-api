import { Router } from "express";
import { authController } from "../../controllers/index.js";
import { verifyToken } from "../../middlewares/authMiddleware.js";

const authRouter = Router();

authRouter.route("/v1/auth/signin").post(authController.signin);
authRouter.route("/v1/auth/signup").post(authController.signup);
authRouter.route("/v1/auth/refresh").post(authController.refresh);
authRouter.route("/v1/auth/signout").get(authController.signout);
authRouter
  .route("/v1/auth/me")
  .get(verifyToken, authController.getAuthenticatedUser);

//authRouter.route("/v1/auth/signout").get(verifyToken, AuthController.signout);
//   .post(validateRequest(signupSchema), AuthController.signup);

export default authRouter;
