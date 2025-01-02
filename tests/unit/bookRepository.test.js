import { jest } from "@jest/globals";
import { connect, clearDatabase, closeDatabase } from "../dbHandler.js";
import bookRepository from "../../src/repositories/bookRepository.js";
import Book from "../../src/models/BookModel.js";

describe("BookRepository", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("BookRepository.findAllBooks", () => {
    test("should return a list of books matching the filters", async () => {
      const filters = { genre: "Fiction" };
      const sortBy = { title: "asc" };
      const page = 0;
      const limit = 5;

      const booksMock = [
        { id: "1", title: "Book One" },
        { id: "2", title: "Book Two" },
      ];

      const findMock = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(booksMock),
      };

      jest.spyOn(Book, "find").mockReturnValue(findMock);

      const result = await bookRepository.findAllBooks(
        filters,
        sortBy,
        page,
        limit
      );

      expect(Book.find).toHaveBeenCalledWith(filters);
      expect(findMock.sort).toHaveBeenCalledWith(sortBy);
      expect(findMock.skip).toHaveBeenCalledWith(page * limit);
      expect(findMock.limit).toHaveBeenCalledWith(limit);
      expect(result).toEqual(booksMock);
    });
  });

  describe("BookRepository.findBookById", () => {
    test("should return a book by ID", async () => {
      const bookId = "60e6f965b4d6c9e529c7f0b3";
      const bookMock = { id: bookId, title: "Test Book" };

      jest.spyOn(Book, "findById").mockResolvedValue(bookMock);

      const result = await bookRepository.findBookById(bookId);

      expect(Book.findById).toHaveBeenCalledWith({ _id: bookId });
      expect(result).toEqual(bookMock);
    });
  });

  describe("BookRepository.findBookByGutenbergId", () => {
    test("should return a book by Gutenberg ID", async () => {
      const gutenbergId = "12345";
      const bookMock = { gutenbergId, title: "Test Book" };

      jest.spyOn(Book, "findOne").mockResolvedValue(bookMock);

      const result = await bookRepository.findBookByGutenbergId(gutenbergId);

      expect(Book.findOne).toHaveBeenCalledWith({ gutenbergId });
      expect(result).toEqual(bookMock);
    });
  });

  describe("BookRepository.updateBook", () => {
    test("should update a book and return the updated document", async () => {
      const bookId = "60e6f965b4d6c9e529c7f0b3";
      const updates = { title: "Updated Title" };

      const bookMock = {
        id: bookId,
        title: "Original Title",
        save: jest
          .fn()
          .mockResolvedValue({ id: bookId, title: "Updated Title" }),
      };

      const updatedBookMock = { id: bookId, title: "Updated Title" };

      jest.spyOn(Book, "findById").mockResolvedValueOnce(bookMock);
      jest.spyOn(Book, "findById").mockResolvedValueOnce(updatedBookMock);

      const result = await bookRepository.updateBook(bookId, updates);

      expect(Book.findById).toHaveBeenCalledWith(bookId);
      expect(bookMock.save).toHaveBeenCalled();
      expect(result).toEqual(updatedBookMock);
    });
  });

  describe("BookRepository.deleteBook", () => {
    test("should delete a book by ID and return the deleted book", async () => {
      const bookId = "60e6f965b4d6c9e529c7f0b3";
      const deletedBookMock = { id: bookId, title: "Deleted Book" };

      jest.spyOn(Book, "findByIdAndDelete").mockResolvedValue(deletedBookMock);

      const result = await bookRepository.deleteBook(bookId);

      expect(Book.findByIdAndDelete).toHaveBeenCalledWith({ _id: bookId });
      expect(result).toEqual(deletedBookMock);
    });
  });

  describe("BookRepository.incrementDownloads", () => {
    test("should increment downloads for a book by ID", async () => {
      const bookId = "60e6f965b4d6c9e529c7f0b3";
      const updatedBookMock = { id: bookId, title: "Test Book", downloads: 1 };

      jest.spyOn(Book, "findByIdAndUpdate").mockResolvedValue(updatedBookMock);

      const result = await bookRepository.incrementDownloads(bookId);

      expect(Book.findByIdAndUpdate).toHaveBeenCalledWith(
        bookId,
        { $inc: { downloads: 1 } },
        { new: true, runValidators: true }
      );
      expect(result).toEqual(updatedBookMock);
    });
  });

  describe("BookRepository.countBooks", () => {
    test("should return the total count of books matching filters", async () => {
      const filters = { genre: "Fiction" };
      const countMock = 10;

      jest.spyOn(Book, "countDocuments").mockResolvedValue(countMock);

      const result = await bookRepository.countBooks(filters);

      expect(Book.countDocuments).toHaveBeenCalledWith(filters);
      expect(result).toBe(countMock);
    });
  });
});
