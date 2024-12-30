import { Router } from "express";
import { userController } from "../../controllers/index.js";
import { validateRequestMiddleware } from "../../middlewares/index.js";
import { userSchemas } from "../../validations/index.js";

const userRouter = Router();

userRouter.post(
  "/v1/users",
  validateRequestMiddleware.validateRequest(
    userSchemas.createUserSchema,
    validateRequestMiddleware.RequestSourceEnum.BODY
  ),
  userController.createUser
);

userRouter.route("/v1/users").get(userController.getAllUsers);
userRouter.route("/v1/users/:id").get(userController.getUserById);
userRouter.route("/v1/users/:id").put(userController.updateUser);
userRouter.route("/v1/users/:id").delete( userController.deleteUser);

export default userRouter;
