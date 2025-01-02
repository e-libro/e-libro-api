import { jest } from "@jest/globals";
import bookService from "../../src/services/bookService.js";
import bookRepository from "../../src/repositories/bookRepository.js";

describe("BookService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("BookService.getAllBooks", () => {
    test("should throw an error if filters is not an object", async () => {
      await expect(bookService.getAllBooks(null, {}, 0, 5)).rejects.toThrow(
        "Filters must be a valid object"
      );
    });

    test("should throw an error if sortBy is not an object", async () => {
      await expect(bookService.getAllBooks({}, null, 0, 5)).rejects.toThrow(
        "SortBy must be a valid object"
      );
    });

    test("should throw an error if page is not a non-negative number", async () => {
      await expect(bookService.getAllBooks({}, {}, -1, 5)).rejects.toThrow(
        "Page must be a non-negative number"
      );
    });

    test("should throw an error if limit is not a positive number", async () => {
      await expect(bookService.getAllBooks({}, {}, 0, -5)).rejects.toThrow(
        "Limit must be a positive number"
      );
    });

    test("should return an empty array if no books are found", async () => {
      const filters = { genre: "Nonexistent Genre" };
      const sortBy = { title: "asc" };
      const page = 0;
      const limit = 5;

      jest.spyOn(bookRepository, "findAllBooks").mockResolvedValue([]);

      const result = await bookService.getAllBooks(
        filters,
        sortBy,
        page,
        limit
      );

      expect(bookRepository.findAllBooks).toHaveBeenCalledWith(
        filters,
        sortBy,
        page,
        limit
      );
      expect(result).toEqual([]);
    });

    test("should return books if found", async () => {
      const filters = { genre: "Fiction" };
      const sortBy = { title: "asc" };
      const page = 0;
      const limit = 5;

      const booksMock = [
        { id: "1", title: "Book One" },
        { id: "2", title: "Book Two" },
      ];

      jest.spyOn(bookRepository, "findAllBooks").mockResolvedValue(booksMock);

      const result = await bookService.getAllBooks(
        filters,
        sortBy,
        page,
        limit
      );

      expect(bookRepository.findAllBooks).toHaveBeenCalledWith(
        filters,
        sortBy,
        page,
        limit
      );
      expect(result).toEqual(booksMock);
    });

    test("should throw an error if repository throws an error", async () => {
      const filters = { genre: "Fiction" };
      const sortBy = { title: "asc" };
      const page = 0;
      const limit = 5;

      jest
        .spyOn(bookRepository, "findAllBooks")
        .mockRejectedValue(new Error("Repository error"));

      await expect(
        bookService.getAllBooks(filters, sortBy, page, limit)
      ).rejects.toThrow("Repository error");
    });
  });

  describe("BookService.getBookById", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    test("should throw an error if book ID is missing", async () => {
      await expect(bookService.getBookById(null)).rejects.toThrow(
        "Book ID must be a valid string"
      );
    });

    test("should throw an error if book ID is not a string", async () => {
      await expect(bookService.getBookById(12345)).rejects.toThrow(
        "Book ID must be a valid string"
      );
    });

    test("should throw an error if book is not found", async () => {
      const bookId = "60e6f965b4d6c9e529c7f0b3";

      jest.spyOn(bookRepository, "findBookById").mockResolvedValue(null);

      await expect(bookService.getBookById(bookId)).rejects.toThrow(
        `Book with ID ${bookId} not found`
      );
    });

    test("should return the book if found", async () => {
      const bookId = "60e6f965b4d6c9e529c7f0b3";
      const bookMock = { id: bookId, title: "Test Book" };

      jest.spyOn(bookRepository, "findBookById").mockResolvedValue(bookMock);

      const result = await bookService.getBookById(bookId);

      expect(bookRepository.findBookById).toHaveBeenCalledWith(bookId);
      expect(result).toEqual(bookMock);
    });

    test("should throw an error if repository throws an error", async () => {
      const bookId = "60e6f965b4d6c9e529c7f0b3";

      jest
        .spyOn(bookRepository, "findBookById")
        .mockRejectedValue(new Error("Repository error"));

      await expect(bookService.getBookById(bookId)).rejects.toThrow(
        "Repository error"
      );
    });
  });

  describe("BookService.updateBook", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    test("should throw an error if book ID is missing", async () => {
      await expect(
        bookService.updateBook(null, { title: "New Title" })
      ).rejects.toThrow("Book ID must be a valid string");
    });

    test("should throw an error if book ID is not a string", async () => {
      await expect(
        bookService.updateBook(12345, { title: "New Title" })
      ).rejects.toThrow("Book ID must be a valid string");
    });

    test("should throw an error if updates are missing", async () => {
      const bookId = "60e6f965b4d6c9e529c7f0b3";
      await expect(bookService.updateBook(bookId, null)).rejects.toThrow(
        "Updates must be a non-empty object"
      );
    });

    test("should throw an error if updates are not an object", async () => {
      const bookId = "60e6f965b4d6c9e529c7f0b3";
      await expect(
        bookService.updateBook(bookId, "invalid-updates")
      ).rejects.toThrow("Updates must be a non-empty object");
    });

    test("should throw an error if updates are an empty object", async () => {
      const bookId = "60e6f965b4d6c9e529c7f0b3";
      await expect(bookService.updateBook(bookId, {})).rejects.toThrow(
        "Updates must be a non-empty object"
      );
    });

    test("should throw an error if book is not found", async () => {
      const bookId = "60e6f965b4d6c9e529c7f0b3";
      const updates = { title: "New Title" };

      jest.spyOn(bookRepository, "updateBook").mockResolvedValue(null);

      await expect(bookService.updateBook(bookId, updates)).rejects.toThrow(
        `Book with ID ${bookId} not found`
      );
    });

    test("should return the updated book if successful", async () => {
      const bookId = "60e6f965b4d6c9e529c7f0b3";
      const updates = { title: "New Title" };
      const updatedBookMock = { id: bookId, title: "New Title" };

      jest
        .spyOn(bookRepository, "updateBook")
        .mockResolvedValue(updatedBookMock);

      const result = await bookService.updateBook(bookId, updates);

      expect(bookRepository.updateBook).toHaveBeenCalledWith(bookId, updates);
      expect(result).toEqual(updatedBookMock);
    });

    test("should throw an error if repository throws an error", async () => {
      const bookId = "60e6f965b4d6c9e529c7f0b3";
      const updates = { title: "New Title" };

      jest
        .spyOn(bookRepository, "updateBook")
        .mockRejectedValue(new Error("Repository error"));

      await expect(bookService.updateBook(bookId, updates)).rejects.toThrow(
        "Repository error"
      );
    });
  });

  describe("BookService.deleteBook", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    test("should throw an error if book ID is missing", async () => {
      await expect(bookService.deleteBook(null)).rejects.toThrow(
        "Book ID must be a valid string"
      );
    });

    test("should throw an error if book is not found", async () => {
      const bookId = "60e6f965b4d6c9e529c7f0b3";

      jest.spyOn(bookRepository, "deleteBook").mockResolvedValue(null);

      await expect(bookService.deleteBook(bookId)).rejects.toThrow(
        `Book with ID ${bookId} not found`
      );
    });

    test("should return the deleted book if successful", async () => {
      const bookId = "60e6f965b4d6c9e529c7f0b3";
      const deletedBookMock = { id: bookId, title: "Deleted Book" };

      jest
        .spyOn(bookRepository, "deleteBook")
        .mockResolvedValue(deletedBookMock);

      const result = await bookService.deleteBook(bookId);

      expect(bookRepository.deleteBook).toHaveBeenCalledWith(bookId);
      expect(result).toEqual(deletedBookMock);
    });
  });

  describe("BookService.incrementDownloads", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    test("should throw an error if book ID is missing", async () => {
      await expect(bookService.incrementDownloads(null)).rejects.toThrow(
        "Book ID must be a valid string"
      );
    });

    test("should throw an error if book is not found", async () => {
      const bookId = "60e6f965b4d6c9e529c7f0b3";

      jest.spyOn(bookRepository, "incrementDownloads").mockResolvedValue(null);

      await expect(bookService.incrementDownloads(bookId)).rejects.toThrow(
        `Book with ID ${bookId} not found`
      );
    });

    test("should return the book with incremented downloads if successful", async () => {
      const bookId = "60e6f965b4d6c9e529c7f0b3";
      const updatedBookMock = { id: bookId, title: "Test Book", downloads: 10 };

      jest
        .spyOn(bookRepository, "incrementDownloads")
        .mockResolvedValue(updatedBookMock);

      const result = await bookService.incrementDownloads(bookId);

      expect(bookRepository.incrementDownloads).toHaveBeenCalledWith(bookId);
      expect(result).toEqual(updatedBookMock);
    });
  });

  describe("BookService.countBooks", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    test("should throw an error if filters are not a valid object", async () => {
      await expect(bookService.countBooks(null)).rejects.toThrow(
        "Filters must be a valid object"
      );
    });

    test("should return the total count of books matching the filters", async () => {
      const filters = { genre: "Fiction" };
      const countMock = 10;

      jest.spyOn(bookRepository, "countBooks").mockResolvedValue(countMock);

      const result = await bookService.countBooks(filters);

      expect(bookRepository.countBooks).toHaveBeenCalledWith(filters);
      expect(result).toBe(countMock);
    });

    test("should throw an error if repository throws an error", async () => {
      const filters = { genre: "Fiction" };

      jest
        .spyOn(bookRepository, "countBooks")
        .mockRejectedValue(new Error("Repository error"));

      await expect(bookService.countBooks(filters)).rejects.toThrow(
        "Repository error"
      );
    });
  });
});
