import { bookService } from "../services/index.js";
import { bookDTO } from "../dtos/index.js";

class bookController {
  async getAllBooks(req, res) {
    try {
      const page = Math.max(0, parseInt(req.query.page) - 1 || 0); // Evita valores negativos
      const limit = parseInt(req.query.limit) || 5;
      // let sort = req.query.sort || "author";
      let title = req.query.title || "";
      let authors = req.query.authors || "";
      let languages = req.query.languages || "es";

      // req.query.sort ? (sort = req.query.sort.split(",")) : (sort = [sort]);

      const languagesOptions = await bookService.getDistinctBookLanguages();

      // Inicializa `filters`
      let filters = {};

      // Manejo de sort
      // let sortBy = {};
      // const validSortFields = ["author", "title", "date"];
      // if (!validSortFields.includes(sort[0])) {
      //   sortBy = { author: "asc" }; // Valor predeterminado
      // } else {
      //   sortBy[sort[0]] = sort[1] || "asc";
      // }

      // Manejo de idiomas
      if (languages === "all") {
        languages = [...languagesOptions];
      } else {
        languages = languages.split(",");
      }
      filters.languages = { $in: languages };

      // Filtros avanzados
      const orConditions = [];
      if (title) {
        const titlePattern = new RegExp(title, "i");
        orConditions.push({ title: { $regex: titlePattern } });
      }

      if (authors) {
        const authorPatterns = authors
          .split(",")
          .map((author) => new RegExp(`^${author.trim()}`, "i"));
        orConditions.push(
          ...authorPatterns.map((pattern) => ({
            "authors.name": { $regex: pattern },
          }))
        );
      }

      if (orConditions.length > 0) {
        filters.$or = orConditions;
      }

      // console.log("Filters:", JSON.stringify(filters, null, 2));
      // console.log("Sort By:", sortBy);
      // console.log(`Page: ${page}, Limit: ${limit}`);

      // Obtener libros y total
      const books = await bookService.getAllBooks(
        filters,
        { title: "asc" },
        page,
        limit
      );

      // const total = await bookService.countBooks(filters);
      const total = books.length;

      if (!books || books.length === 0) {
        return res.status(204).json({
          message: "No content",
        });
      }

      // Mapear libros
      const bookResponseDTOs = books.map((book) =>
        bookDTO.mapBookToBookResponseDTO(book)
      );

      const response = {
        totalBooks: total,
        totalPages: Math.ceil(total / limit),
        page: page + 1,
        limit,
        languages,
        books: bookResponseDTOs,
      };

      //  ---- Código de depuración ----
      console.log(title);

      bookResponseDTOs.forEach((book) => {
        console.log(book.id);
      });

      return res.status(200).json(response);
    } catch (error) {
      console.error("Error in getAllBooks:", error.message);
      return res.status(500).json({
        statusCode: 500,
        message: "Internal Server Error",
      });
    }
  }

  async getBookById(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          errorMessage: "Bad Request: Missing book ID",
        });
      }

      const book = await bookService.getBookById(id);

      if (!book) {
        return res.status(404).json({
          errorMessage: "Book Not Found",
        });
      }

      const bookResponseDTO = bookDTO.mapBookToBookResponseDTO(book);

      return res.status(200).json({
        book: bookResponseDTO,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
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
