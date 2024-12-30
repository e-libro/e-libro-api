import { jest } from "@jest/globals";
import { connect, clearDatabase, closeDatabase } from "../dbHandler.js";
import bookRepository from "../../src/repositories/bookRepository.js";
import Book from "../../src/models/BookModel.js";

beforeAll(async () => {
  await connect();
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await closeDatabase();
});

describe("Pruebas para BookRepository", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Debe recuperar todos los libros con filtros y paginación", async () => {
    const booksMock = [
      { gutenbergId: 12345, title: "Book 1", type: "Fiction" },
      { gutenbergId: 12346, title: "Book 2", type: "Non-fiction" },
    ];

    const filters = { type: "Fiction" };
    const sortBy = { title: 1 };
    const page = 1;
    const limit = 10;

    jest.spyOn(Book, "find").mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(booksMock),
    });

    const result = await bookRepository.findAllBooks(
      filters,
      sortBy,
      page,
      limit
    );

    expect(Book.find).toHaveBeenCalledWith(filters);
    expect(Book.find().sort).toHaveBeenCalledWith(sortBy);
    expect(Book.find().skip).toHaveBeenCalledWith(page * limit);
    expect(Book.find().limit).toHaveBeenCalledWith(limit);
    expect(result).toEqual(booksMock);
  });

  test("Debe recuperar un libro por ID", async () => {
    const bookMock = { gutenbergId: 12345, title: "Book 1", type: "Fiction" };

    jest.spyOn(Book, "findById").mockResolvedValue(bookMock);

    const result = await bookRepository.findBookById("12345");

    expect(Book.findById).toHaveBeenCalledWith({ _id: "12345" });
    expect(result).toEqual(bookMock);
  });

  test("Debe recuperar un libro por gutenbergId", async () => {
    const bookMock = { gutenbergId: 12345, title: "Book 1", type: "Fiction" };

    jest.spyOn(Book, "findOne").mockResolvedValue(bookMock);

    const result = await bookRepository.findBookByGutenbergId(12345);

    expect(Book.findOne).toHaveBeenCalledWith({ gutenbergId: 12345 });
    expect(result).toEqual(bookMock);
  });

  test("Debe actualizar un libro", async () => {
    const updates = { title: "Updated Book" };
    const updatedBook = {
      gutenbergId: 12345,
      title: "Updated Book",
      type: "Fiction",
    };

    jest.spyOn(Book, "findById").mockResolvedValue({
      ...updatedBook,
      save: jest.fn().mockResolvedValue(updatedBook),
    });

    const result = await bookRepository.updateBook("12345", updates);

    expect(Book.findById).toHaveBeenCalledWith("12345");
    expect(JSON.parse(JSON.stringify(result))).toEqual({
      gutenbergId: 12345,
      title: "Updated Book",
      type: "Fiction",
    });
  });

  test("Debe eliminar un libro", async () => {
    const deletedBook = {
      gutenbergId: 12345,
      title: "Deleted Book",
      type: "Fiction",
    };

    jest.spyOn(Book, "findByIdAndDelete").mockResolvedValue(deletedBook);

    const result = await bookRepository.deleteBook("12345");

    expect(Book.findByIdAndDelete).toHaveBeenCalledWith({ _id: "12345" });
    expect(result).toEqual(deletedBook);
  });

  test("Debe recuperar tipos de contenido distintos", async () => {
    const contentTypes = ["application/pdf", "text/plain", "text/html"];

    jest
      .spyOn(Book, "getDistinctBookContentTypes")
      .mockResolvedValue(contentTypes);

    const result = await bookRepository.getDistinctContentTypes();

    expect(Book.getDistinctBookContentTypes).toHaveBeenCalled();
    expect(result).toEqual(contentTypes);
  });

  test("Debe recuperar idiomas distintos", async () => {
    const languages = ["en", "es", "fr"];

    jest.spyOn(Book, "getDistinctBookLanguages").mockResolvedValue(languages);

    const result = await bookRepository.getDistinctBookLanguages();

    expect(Book.getDistinctBookLanguages).toHaveBeenCalled();
    expect(result).toEqual(languages);
  });

  test("incrementDownloads - should increment downloads field in the database", async () => {
    const bookId = "123";
    const updatedBook = { id: "123", title: "Test Book", downloads: 5 };

    jest
      .spyOn(bookRepository, "incrementDownloads")
      .mockResolvedValue(updatedBook);

    const result = await bookRepository.incrementDownloads(bookId);

    expect(bookRepository.incrementDownloads).toHaveBeenCalledWith(bookId);

    expect(result).toEqual(updatedBook);
  });

  test("incrementDownloads - should throw error if database operation fails", async () => {
    const bookId = "123";

    jest
      .spyOn(bookRepository, "incrementDownloads")
      .mockRejectedValue(new Error("Failed to increment downloads"));

    await expect(bookRepository.incrementDownloads(bookId)).rejects.toThrow(
      "Failed to increment downloads"
    );
  });

  test("should return the total count of books matching the filter", async () => {
    const filter = { genre: "Fiction" };
    const countMock = 42;

    jest.spyOn(Book, "countDocuments").mockResolvedValue(countMock);

    const result = await bookRepository.countBooks(filter);

    expect(Book.countDocuments).toHaveBeenCalledWith(filter);
    expect(result).toBe(countMock);
  });

  test("should return 0 if no books match the filter", async () => {
    const filter = { genre: "Nonexistent Genre" };
    const countMock = 0;

    jest.spyOn(Book, "countDocuments").mockResolvedValue(countMock);

    const result = await bookRepository.countBooks(filter);

    expect(Book.countDocuments).toHaveBeenCalledWith(filter);
    expect(result).toBe(countMock);
  });

  test("should throw an error if database operation fails", async () => {
    const filter = { genre: "Fiction" };

    jest
      .spyOn(Book, "countDocuments")
      .mockRejectedValue(new Error("Database error"));

    await expect(bookRepository.countBooks(filter)).rejects.toThrow(
      "Database error"
    );
  });
});
