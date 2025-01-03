import ApiError from "../errors/ApiError.js";
import db from "../models/index.js";

class ReportController {
  async getTopBooksReport(req, res, next) {
    try {
      // Consulta para obtener los libros ordenados por descargas
      const books = await db.Book.find({})
        .sort({ downloads: -1 }) // Ordenar por descargas descendente
        .limit(5); // Limitar a los 10 primeros

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

  async getLanguagesDistributionReport(req, res, next) {
    try {
      const languageDistribution = await db.Book.aggregate([
        { $unwind: "$languages" }, // Descomponer el array de idiomas
        { $group: { _id: "$languages", count: { $sum: 1 } } }, // Agrupar por idioma y contar
        { $project: { language: "$_id", count: 1, _id: 0 } }, // Formatear los datos de salida
      ]);

      if (!languageDistribution || languageDistribution.length === 0) {
        throw ApiError.NotFound("No languages found");
      }

      // Agrupar idiomas con menos de 500 libros bajo "Otros"
      const groupedData = languageDistribution.reduce(
        (acc, item) => {
          if (item.count < 500) {
            acc.others.count += item.count;
          } else {
            acc.filtered.push(item);
          }
          return acc;
        },
        { filtered: [], others: { language: "Otros", count: 0 } }
      );

      if (groupedData.others.count > 0) {
        groupedData.filtered.push(groupedData.others);
      }

      return res.status(200).json({
        status: "success",
        message: "Languages distribution data retrieved successfully",
        data: groupedData.filtered,
        error: null,
      });
    } catch (error) {
      console.error("Error fetching languages distribution:", error);
      next(
        ApiError.InternalServerError(
          "Failed to retrieve languages distribution"
        )
      );
    }
  }

  async getUsersByMonthReport(req, res, next) {
    try {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      // Buscar usuarios con rol 'user' creados en el último año
      const users = await db.User.aggregate([
        {
          $match: {
            role: "user",
            createdAt: { $gte: oneYearAgo },
          },
        },
        {
          $group: {
            _id: { $month: "$createdAt" },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);

      // Mapear el resultado para incluir los nombres de los meses
      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      const reportData = users.map((item) => ({
        month: months[item._id - 1],
        count: item.count,
      }));

      return res.status(200).json({
        status: "success",
        message: "Users report by month retrieved successfully",
        data: reportData,
        error: null,
      });
    } catch (error) {
      console.error("Error fetching users report by month:", error);
      next(
        ApiError.InternalServerError("Error fetching users report by month")
      );
    }
  }
}

export default new ReportController();
