import bookRepository from "../repositories/bookRepository.js";
import dotenv from "dotenv";
dotenv.config();
const env = process.env.NODE_ENV || "development";

class BookService {
  async getAllBooks(filters, sortBy, page, limit) {
    try {
      if (!filters || typeof filters !== "object") {
        throw new Error(
          `Filters must be a valid object, received: ${typeof filters}`
        );
      }

      if (!sortBy || typeof sortBy !== "object") {
        throw new Error(
          `SortBy must be a valid object, received: ${typeof sortBy}`
        );
      }
      if (typeof page !== "number" || page < 0) {
        throw new Error(
          `Page must be a non-negative number, received: ${page}`
        );
      }
      if (typeof limit !== "number" || limit <= 0) {
        throw new Error(`Limit must be a positive number, received: ${limit}`);
      }

      const books = await bookRepository.findAllBooks(
        filters,
        sortBy,
        page,
        limit
      );

      return books;
    } catch (error) {
      throw error;
    }
  }

  async getBookById(id) {
    try {
      if (!id || typeof id !== "string") {
        throw new Error("Book ID must be a valid string");
      }

      const book = await bookRepository.findBookById(id);

      if (!book) {
        throw new Error(`Book with ID ${id} not found`);
      }

      return book;
    } catch (error) {
      throw error;
    }
  }

  async updateBook(id, updates) {
    try {
      // Validar que el ID sea una cadena válida
      if (!id || typeof id !== "string") {
        throw new Error("Book ID must be a valid string");
      }

      // Validar que `updates` sea un objeto con al menos una propiedad
      if (
        !updates ||
        typeof updates !== "object" ||
        Object.keys(updates).length === 0
      ) {
        throw new Error("Updates must be a non-empty object");
      }

      // Llamar al repositorio para actualizar el libro
      const updatedBook = await bookRepository.updateBook(id, updates);

      // Verificar si el libro fue encontrado y actualizado
      if (!updatedBook) {
        throw new Error(`Book with ID ${id} not found`);
      }

      return updatedBook;
    } catch (error) {
      throw error;
    }
  }

  async deleteBook(id) {
    try {
      if (!id || typeof id !== "string") {
        throw new Error("Book ID must be a valid string");
      }

      const deletedBook = await bookRepository.deleteBook(id);

      if (!deletedBook) {
        throw new Error(`Book with ID ${id} not found`);
      }

      return deletedBook;
    } catch (error) {
      throw error;
    }
  }

  async incrementDownloads(bookId) {
    try {
      if (!bookId || typeof bookId !== "string") {
        throw new Error("Book ID must be a valid string");
      }

      const book = await bookRepository.incrementDownloads(bookId);

      if (!book) {
        throw new Error(`Book with ID ${bookId} not found`);
      }

      return book;
    } catch (error) {
      throw error;
    }
  }

  async countBooks(filters) {
    try {
      if (!filters || typeof filters !== "object") {
        throw new Error("Filters must be a valid object");
      }

      return await bookRepository.countBooks(filters);
    } catch (error) {
      console.log("Error in BookService.countBooks:", error.message);
      throw error;
    }
  }
}

export default new BookService();
