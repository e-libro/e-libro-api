import { Router } from "express";
import { bookController } from "../../controllers/index.js";

// const cache = apicache.middleware;

const bookRouter = Router();

bookRouter.get(
  "/v1/books",
  //verifyToken,
  // cache("1 day"),
  bookController.getAllBooks
);

bookRouter.get(
  "/v1/books/:id",
  // verifyToken,
  // cache("1 day"),
  bookController.getBookById
);

bookRouter.patch("/v1/books/:id/downloads", bookController.incrementDownloads);

export default bookRouter;
