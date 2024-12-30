import { Router } from "express";
import { userController } from "../../controllers/index.js";
import { verifyToken } from "../../middlewares/authMiddleware.js";
import { validateRequestMiddleware } from "../../middlewares/index.js";
import { userSchemas } from "../../validations/index.js";


const userRouter = Router();

userRouter
.route("/v1/users")
.post(
  verifyToken,
  validateRequestMiddleware.validateRequest(
    userSchemas.createUserSchema,
    validateRequestMiddleware.RequestSourceEnum.BODY
  ),
  userController.createUser
);

userRouter.route("/v1/users").get(verifyToken, userController.getAllUsers);
userRouter.route("/v1/users/:id").get(verifyToken, userController.getUserById);
userRouter.route("/v1/users/:id").put(verifyToken, userController.updateUser);
userRouter.route("/v1/users/:id").delete(verifyToken, userController.deleteUser);

export default userRouter;
