import { Router } from "express";
import { userController } from "../../controllers/index.js";
import { authMiddleware } from "../../middlewares/index.js";
import { validateRequestMiddleware } from "../../middlewares/index.js";
import { userSchemas } from "../../validations/index.js";

const userRouter = Router();

userRouter
  .route("/v1/users")
  .post(
    authMiddleware.verifyToken,
    authMiddleware.verifyRole(["admin"]),
    validateRequestMiddleware.validateRequest(
      userSchemas.createUserSchema,
      validateRequestMiddleware.RequestSourceEnum.BODY
    ),
    userController.createUser
  );

userRouter
  .route("/v1/users")
  .get(
    authMiddleware.verifyToken,
    authMiddleware.verifyRole(["admin"]),
    userController.getAllUsers
  );
userRouter
  .route("/v1/users/:id")
  .get(
    authMiddleware.verifyToken,
    authMiddleware.verifyRole(["admin"]),
    userController.getUserById
  );
userRouter
  .route("/v1/users/:id")
  .put(
    authMiddleware.verifyToken,
    authMiddleware.verifyRole(["admin"]),
    userController.updateUser
  );
userRouter
  .route("/v1/users/:id")
  .delete(
    authMiddleware.verifyToken,
    authMiddleware.verifyRole(["admin"]),
    userController.deleteUser
  );

export default userRouter;
