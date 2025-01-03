import { Router } from "express";
import { reportController } from "../../controllers/index.js";
import { authMiddleware } from "../../middlewares/index.js";

const reportRouter = Router();

reportRouter
  .route("/v1/reports/top-books")
  .get(
    authMiddleware.verifyToken,
    authMiddleware.verifyRole(["admin"]),
    reportController.getTopBooksReport
  );

export default reportRouter;
