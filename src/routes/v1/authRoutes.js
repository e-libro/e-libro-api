import { Router } from "express";
import { authController } from "../../controllers/index.js";

const authRouter = Router();

authRouter.route("/v1/auth/signin").post(authController.signin);
authRouter.route("/v1/auth/signup").post(authController.signup);
authRouter.route("/v1/auth/refresh").post(authController.refresh);
authRouter.route("/v1/auth/signout").get(authController.signout);
authRouter.route("/v1/auth/me").get((req, res) => {
  return res.status(200).json({
    id: "674547ac7056b20c3392305e",
    fullname: "Alfredo Arias",
    email: "alfredo.ernesto.arias@gmail.com",
    role: "admin",
    createdAt: "2021-07-19T17:00:00.000Z",
  });
});

//authRouter.route("/v1/auth/signout").get(verifyToken, AuthController.signout);
//   .post(validateRequest(signupSchema), AuthController.signup);

export default authRouter;
