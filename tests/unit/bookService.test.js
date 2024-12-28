import { jest } from "@jest/globals";
import bookService from "../../src/services/bookService.js";
import bookRepository from "../../src/repositories/bookRepository.js";

describe("Pruebas para bookService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Debe lanzar un error si faltan campos requeridos al crear un libro", async () => {
    const incompleteBook = { title: "Test Book" };

    await expect(bookService.createBook(incompleteBook)).rejects.toThrow(
      "Missing required fields: gutenbergId, title, and type are mandatory"
    );
  });

  test("Debe lanzar un error si el libro ya existe", async () => {
    const bookData = {
      gutenbergId: 12345,
      title: "Test Book",
      type: "Fiction",
    };

    jest
      .spyOn(bookRepository, "findBookByGutenbergId")
      .mockResolvedValue(bookData);

    await expect(bookService.createBook(bookData)).rejects.toThrow(
      "A book with this Gutenberg ID already exists"
    );
  });

  test("Debe crear un libro si los datos son válidos", async () => {
    const bookData = {
      gutenbergId: 12345,
      title: "Test Book",
      type: "Fiction",
    };

    jest.spyOn(bookRepository, "findBookByGutenbergId").mockResolvedValue(null);
    jest.spyOn(bookRepository, "createBook").mockResolvedValue(bookData);

    const result = await bookService.createBook(bookData);

    expect(bookRepository.findBookByGutenbergId).toHaveBeenCalledWith(12345);
    expect(bookRepository.createBook).toHaveBeenCalledWith(bookData);
    expect(result).toEqual(bookData);
  });

  test("Debe recuperar todos los libros con filtros y paginación", async () => {
    const filters = { type: "Fiction" };
    const sortBy = { title: 1 };
    const page = 1;
    const limit = 10;
    const booksMock = [
      { gutenbergId: 12345, title: "Book 1", type: "Fiction" },
      { gutenbergId: 12346, title: "Book 2", type: "Non-fiction" },
    ];

    jest.spyOn(bookRepository, "findAllBooks").mockResolvedValue(booksMock);

    const result = await bookService.getAllBooks(filters, sortBy, page, limit);

    expect(bookRepository.findAllBooks).toHaveBeenCalledWith(
      filters,
      sortBy,
      page,
      limit
    );
    expect(result).toEqual(booksMock);
  });

  test("Debe lanzar un error si falta el ID al buscar un libro", async () => {
    await expect(bookService.getBookById(null)).rejects.toThrow(
      "ID is required"
    );
  });

  test("Debe lanzar un error si no se encuentra un libro con el ID proporcionado", async () => {
    jest.spyOn(bookRepository, "findBookById").mockResolvedValue(null);

    await expect(bookService.getBookById("12345")).rejects.toThrow(
      "Book with ID 12345 not found"
    );
  });

  test("Debe recuperar un libro por ID", async () => {
    const bookMock = { gutenbergId: 12345, title: "Book 1", type: "Fiction" };

    jest.spyOn(bookRepository, "findBookById").mockResolvedValue(bookMock);

    const result = await bookService.getBookById("12345");

    expect(bookRepository.findBookById).toHaveBeenCalledWith("12345");
    expect(result).toEqual(bookMock);
  });

  test("Debe actualizar un libro si los datos son válidos", async () => {
    const updates = { title: "Updated Book" };
    const updatedBook = {
      gutenbergId: 12345,
      title: "Updated Book",
      type: "Fiction",
    };

    jest.spyOn(bookRepository, "updateBook").mockResolvedValue(updatedBook);

    const result = await bookService.updateBook("12345", updates);

    expect(bookRepository.updateBook).toHaveBeenCalledWith("12345", updates);
    expect(result).toEqual(updatedBook);
  });

  test("Debe lanzar un error si falta el ID al eliminar un libro", async () => {
    await expect(bookService.deleteBook(null)).rejects.toThrow(
      "ID is required"
    );
  });

  test("Debe lanzar un error si no se encuentra el libro al eliminar", async () => {
    jest.spyOn(bookRepository, "deleteBook").mockResolvedValue(null);

    await expect(bookService.deleteBook("12345")).rejects.toThrow(
      "Book with ID 12345 not found"
    );
  });

  test("Debe eliminar un libro si los datos son válidos", async () => {
    const deletedBook = {
      gutenbergId: 12345,
      title: "Deleted Book",
      type: "Fiction",
    };

    jest.spyOn(bookRepository, "deleteBook").mockResolvedValue(deletedBook);

    const result = await bookService.deleteBook("12345");

    expect(bookRepository.deleteBook).toHaveBeenCalledWith("12345");
    expect(result).toEqual(deletedBook);
  });

  test("Debe recuperar tipos de contenido distintos", async () => {
    const contentTypes = ["application/pdf", "text/plain", "text/html"];

    jest
      .spyOn(bookRepository, "getDistinctContentTypes")
      .mockResolvedValue(contentTypes);

    const result = await bookService.getDistinctContentTypes();

    expect(bookRepository.getDistinctContentTypes).toHaveBeenCalled();
    expect(result).toEqual(contentTypes);
  });

  test("Debe recuperar idiomas distintos", async () => {
    const languages = ["en", "es", "fr"];

    jest
      .spyOn(bookRepository, "getDistinctBookLanguages")
      .mockResolvedValue(languages);

    const result = await bookService.getDistinctBookLanguages();

    expect(bookRepository.getDistinctBookLanguages).toHaveBeenCalled();
    expect(result).toEqual(languages);
  });

  // -----------------------------
  test("incrementDownloads - should increment downloads and return the updated book", async () => {
    const bookId = "123";
    const updatedBook = {
      gutenbergId: "123",
      title: "Test Book",
      authors: ["Author Name"],
      downloads: 5,
      formats: [
        { contentType: "image/jpeg", url: "http://example.com/cover.jpg" },
        { contentType: "text/plain", url: "http://example.com/content.txt" },
      ],
    };

    jest
      .spyOn(bookRepository, "incrementDownloads")
      .mockResolvedValue(updatedBook);

    const result = await bookService.incrementDownloads(bookId);

    expect(bookRepository.incrementDownloads).toHaveBeenCalledWith(bookId);
    expect(result).toEqual(updatedBook);
  });

  test("incrementDownloads - should throw error if book ID is not provided", async () => {
    await expect(bookService.incrementDownloads(null)).rejects.toThrow(
      "Book ID is required"
    );
  });

  test("incrementDownloads - should throw error if book is not found", async () => {
    const bookId = "123";

    jest.spyOn(bookRepository, "incrementDownloads").mockResolvedValue(null);

    await expect(bookService.incrementDownloads(bookId)).rejects.toThrow(
      `Book with ID ${bookId} not found`
    );
  });
});
