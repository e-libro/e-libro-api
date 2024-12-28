import { Router } from "express";
import { userController } from "../../controllers/index.js";
import {
  verifyRequestMiddleware,
  validateRequestMiddleware,
} from "../../middlewares/index.js";
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

userRouter.get("/v1/users", userController.getAllUsers);
userRouter.get("/v1/users/:id", userController.getUserById);
userRouter.put("/v1/users/:id", userController.updateUser);
userRouter.delete("/v1/users/:id", userController.deleteUser);

export default userRouter;
