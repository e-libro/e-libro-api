import { bookService } from "../services/index.js";
import { bookDTO } from "../dtos/index.js";

class bookController {
  async getAllBooks(req, res) {
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
        return res.sendStatus(204);
      }

      const bookResponseDTOs = books.map((book) =>
        bookDTO.mapBookToBookResponseDTO(book)
      );

      const response = {
        totalBooks: total,
        totalPages: Math.ceil(total / limit),
        page: page + 1,
        limit,
        books: bookResponseDTOs,
        language, // opcional, para que el frontend sepa el idioma aplicado en el filtro
      };

      return res.status(200).json(response);
    } catch (error) {
      console.error("Error in getAllBooks:", error.message);
      return res.status(500).json({
        errorMessage: "Internal Server Error",
      });
    }
  }

  async getBookById(req, res) {
    try {
      const { id } = req.params || null;

      const book = await bookService.getBookById(id);

      if (!book) {
        return res.status(404).json({
          status: "error",
          message: "Book Not Found",
        });
      }

      const bookResponseDTO = bookDTO.mapBookToBookResponseDTO(book);

      return res.status(200).json({
        status: "success",
        data: bookResponseDTO,
      });
    } catch (error) {
      console.error("Error fetching book by ID:", error.message);
      return res.status(500).json({
        status: "error",
        message: "Internal Server Error",
      });
    }
  }

  async incrementDownloads(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ errorMessage: "Book ID is required" });
      }

      const updatedBook = await bookService.incrementDownloads(id);

      const bookResponseDTO = bookDTO.mapBookToBookResponseDTO(updatedBook);

      return res.status(200).json({
        message: "Book downloads incremented successfully",
        book: bookResponseDTO,
      });
    } catch (error) {
      if (error.message.includes("not found")) {
        return res.status(404).json({ errorMessage: error.message });
      }
      console.error(`Error in incrementDownloads: ${error.message}`);
      return res.status(500).json({
        errorMessage: "Internal Server Error",
      });
    }
  }
}

export default new bookController();
