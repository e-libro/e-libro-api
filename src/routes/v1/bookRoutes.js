import { Router } from "express";
import { bookController } from "../../controllers/index.js";
import { authMiddleware } from "../../middlewares/index.js";

const bookRouter = Router();

bookRouter
  .route("/v1/books")
  .get(authMiddleware.verifyToken, bookController.getAllBooks);

bookRouter
  .route("/v1/books/:id")
  .get(authMiddleware.verifyToken, bookController.getBookById);

bookRouter
  .route("/v1/books/:id/downloads")
  .patch(authMiddleware.verifyToken, bookController.incrementDownloads);

export default bookRouter;
