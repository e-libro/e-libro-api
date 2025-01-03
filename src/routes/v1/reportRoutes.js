import { Router } from "express";
import { reportController } from "../../controllers/index.js";
import { authMiddleware } from "../../middlewares/index.js";

const reportRouter = Router();

reportRouter
  .route("/v1/reports/books/top-books")
  .get(
    authMiddleware.verifyToken,
    authMiddleware.verifyRole(["admin"]),
    reportController.getTopBooksReport
  );

reportRouter
  .route("/v1/reports/books/languages-distribution")
  .get(
    authMiddleware.verifyToken,
    reportController.getLanguagesDistributionReport
  );

reportRouter
  .route("/v1/reports/users/monthly-signups")
  .get(authMiddleware.verifyToken, reportController.getUsersByMonthReport);

export default reportRouter;
