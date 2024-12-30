import { Router } from "express";
import { bookController } from "../../controllers/index.js";
import { verifyToken } from "../../middlewares/authMiddleware.js";
import apicache from "apicache";
const cache = apicache.middleware;

const bookRouter = Router();

bookRouter
  .route("/v1/books",)
  .get(
    verifyToken,
    cache("1 hour"),
    bookController.getAllBooks
);

bookRouter
  .route("/v1/books/:id")
  .get(
    verifyToken,
    cache("1 day"),
    bookController.getBookById
);

bookRouter
.route("/v1/books/:id/downloads")
.patch(
  verifyToken,
  bookController.incrementDownloads
);

export default bookRouter;
