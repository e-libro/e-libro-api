import bookRepository from "../repositories/bookRepository.js";

class BookService {
  async createBook(book) {
    if (!book.gutenbergId || !book.title || !book.type) {
      throw new Error(
        "Missing required fields: gutenbergId, title, and type are mandatory"
      );
    }

    const existingBook = await bookRepository.findBookByGutenbergId(
      book.gutenbergId
    );

    if (existingBook) {
      throw new Error("A book with this Gutenberg ID already exists");
    }

    return await bookRepository.createBook(book);
  }

  async getAllBooks(filters, sortBy, page, limit) {
    return await bookRepository.findAllBooks(filters, sortBy, page, limit);
  }

  async getBookById(id) {
    if (!id) {
      throw new Error("ID is required");
    }

    const book = await bookRepository.findBookById(id);

    if (!book) {
      throw new Error(`Book with ID ${id} not found`);
    }

    return book;
  }

  async getBookByGutenbergId(id) {
    if (!id) {
      throw new Error("ID is required");
    }

    const book = await bookRepository.findBookByGutenbergId(id);

    if (!book) {
      throw new Error(`Book with ID ${id} not found`);
    }

    return book;
  }

  async updateBook(id, updates) {
    if (!id || !updates || Object.keys(updates).length === 0) {
      throw new Error("ID and updates are required");
    }

    return await bookRepository.updateBook(id, updates);
  }

  async deleteBook(id) {
    if (!id) {
      throw new Error("ID is required");
    }

    const deletedBook = await bookRepository.deleteBook(id);
    if (!deletedBook) {
      throw new Error(`Book with ID ${id} not found`);
    }

    return deletedBook;
  }

  async getDistinctContentTypes() {
    return await bookRepository.getDistinctContentTypes();
  }

  async getDistinctBookLanguages() {
    return await bookRepository.getDistinctBookLanguages();
  }

  async incrementDownloads(bookId) {
    if (!bookId) {
      throw new Error("Book ID is required");
    }
    const book = await bookRepository.incrementDownloads(bookId);
    if (!book) {
      throw new Error(`Book with ID ${bookId} not found`);
    }
    return book;
  }
}

export default new BookService();
