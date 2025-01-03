import { Router } from "express";
import { authController } from "../../controllers/index.js";
import { authMiddleware } from "../../middlewares/index.js";
import { validateRequestMiddleware } from "../../middlewares/index.js";
import { authSchemas } from "../../validations/index.js";

const authRouter = Router();

authRouter
  .route("/v1/auth/signin")
  .post(
    validateRequestMiddleware.validateRequest(
      authSchemas.signinSchema,
      validateRequestMiddleware.RequestSourceEnum.BODY
    ),
    authController.signin
  );
authRouter
  .route("/v1/auth/signup")
  .post(
    validateRequestMiddleware.validateRequest(
      authSchemas.signupSchema,
      validateRequestMiddleware.RequestSourceEnum.BODY
    ),
    authController.signup
  );
authRouter.route("/v1/auth/refresh").post(authController.refresh);
authRouter
  .route("/v1/auth/signout")
  .get(authMiddleware.verifyToken, authController.signout);
authRouter
  .route("/v1/auth/me")
  .post(authMiddleware.verifyToken, authController.getAuthenticatedUser);
authRouter
  .route("/v1/auth/change-password")
  .patch(
    authMiddleware.verifyToken,
    validateRequestMiddleware.validateRequest(
      authSchemas.changePasswordSchema,
      validateRequestMiddleware.RequestSourceEnum.BODY
    ),
    authController.changePassword
  );

export default authRouter;
