import ApiError from "../errors/ApiError.js";
import db from "../models/index.js";

class ReportController {
  async getTopBooksReport(req, res, next) {
    try {
      // Consulta para obtener los libros ordenados por descargas
      const books = await db.Book.find({})
        .sort({ downloads: -1 }) // Ordenar por descargas descendente
        .limit(10); // Limitar a los 10 primeros

      // Calcular el total de descargas
      const totalDownloads = books.reduce(
        (sum, book) => sum + (book.downloads || 0),
        0
      );

      // Agregar el porcentaje a cada libro
      const enrichedBooks = books.map((book) => ({
        id: book._id,
        title: book.title,
        downloads: book.downloads || 0,
        percentage: (((book.downloads || 0) / totalDownloads) * 100).toFixed(2),
      }));

      // Responder con los datos
      return res.status(200).json({
        status: "success",
        message: "Report data retrieved successfully",
        data: enrichedBooks,
        error: null,
      });
    } catch (error) {
      console.error("Error fetching top books:", error);
      next(ApiError.InternalServerError("Failed to load top books data"));
    }
  }
}

export default new ReportController();
