import { bookService } from "../services/index.js";
import { bookDTO } from "../dtos/index.js";
import mongoose from "mongoose";
import ApiError from "../errors/ApiError.js";
import dotenv from "dotenv";
dotenv.config();

const env = process.env.NODE_ENV || "development";

class bookController {
  async getAllBooks(req, res, next) {
    try {
      const page = Math.max(0, parseInt(req.query.page) - 1 || 0);
      const limit = parseInt(req.query.limit) || 5;

      const title = req.query.title || "";
      const author = req.query.author || "";

      const language = req.query.language || "es";

      const filters = {};

      if (title) {
        filters.title = { $regex: new RegExp(title, "i") };
      }

      if (author) {
        filters["authors.name"] = { $regex: new RegExp(author, "i") };
      }

      filters.languages = { $in: [language] };

      const sortBy = { title: "asc" };

      const books = await bookService.getAllBooks(filters, sortBy, page, limit);

      const total = await bookService.countBooks(filters);

      if (!books || books.length === 0) {
        throw ApiError.NotFound("No books found");
      }

      const bookResponseDTOs = books.map((book) =>
        bookDTO.mapBookToBookResponseDTO(book)
      );

      const data = {
        totalDocuments: total,
        totalPages: Math.ceil(total / limit),
        page: page + 1,
        limit,
        documents: bookResponseDTOs,
        language,
      };

      return res.status(200).json({
        status: "success",
        message: "Book retrieved successfully",
        data: data,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  }

  async getBookById(req, res, next) {
    try {
      const { id } = req.params;

      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw ApiError.BadRequest("Invalid or missing book ID");
      }

      const book = await bookService.getBookById(id);

      if (!book) {
        throw ApiError.NotFound("Book not found");
      }

      const bookResponseDTO = bookDTO.mapBookToBookResponseDTO(book);

      return res.status(200).json({
        status: "success",
        message: "Book retrieved successfully",
        data: bookResponseDTO,
        error: null,
      });
    } catch (error) {
      if (env === "development") {
        console.error("bookController.getBookById error: ", error);
      }

      if (error.message.includes("not found")) {
        return res.status(404).json({
          status: "error",
          message: "Book not found",
          data: null,
          error: {
            code: 404,
            details: error.message,
          },
        });
      }

      next(error);
    }
  }

  async incrementDownloads(req, res, next) {
    try {
      const { id } = req.params;
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw ApiError.BadRequest("Invalid or missing book ID");
      }

      const updatedBook = await bookService.incrementDownloads(id);

      if (!updatedBook) {
        throw ApiError.NotFound("Book not found");
      }

      const bookResponseDTO = bookDTO.mapBookToBookResponseDTO(updatedBook);

      return res.status(200).json({
        status: "success",
        message: "Book downloads incremented successfully",
        data: bookResponseDTO,
        error: null,
      });
    } catch (error) {
      if (env === "development") {
        console.error(
          "bookController.incrementDownloads error: ",
          error.message
        );
      }

      next(error);
    }
  }
}

export default new bookController();
