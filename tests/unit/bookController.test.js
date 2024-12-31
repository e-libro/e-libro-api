import { jest } from "@jest/globals";
import bookController from "../../src/controllers/bookController.js";
import bookService from "../../src/services/bookService.js";
import bookDTO from "../../src/dtos/bookDTO.js";

describe("bookController", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("getAllBooks - should return 200 with paginated books and metadata", async () => {
    const req = {
      query: {
        page: "1",
        limit: "5",
        title: "Test Title",
        author: "Author Name",
        language: "en",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const filters = {
      title: { $regex: /Test Title/i },
      "authors.name": { $regex: /Author Name/i },
      languages: { $in: ["en"] },
    };

    const books = [
      {
        id: "1",
        title: "Book 1",
        authors: [{ name: "Author Name" }],
        languages: ["en"],
      },
      {
        id: "2",
        title: "Book 2",
        authors: [{ name: "Author Name" }],
        languages: ["en"],
      },
    ];
    const total = 10;

    const bookResponseDTOs = books.map((book) => ({
      id: book.id,
      title: book.title,
      authors: book.authors.map((author) => author.name),
      languages: book.languages,
    }));

    jest.spyOn(bookService, "getAllBooks").mockResolvedValue(books);
    jest.spyOn(bookService, "countBooks").mockResolvedValue(total);
    jest
      .spyOn(bookDTO, "mapBookToBookResponseDTO")
      .mockImplementation((book) => ({
        id: book.id,
        title: book.title,
        authors: book.authors.map((author) => author.name),
        languages: book.languages,
      }));

    await bookController.getAllBooks(req, res);

    expect(bookService.getAllBooks).toHaveBeenCalledWith(
      filters,
      { title: "asc" },
      0,
      5
    );
    expect(bookService.countBooks).toHaveBeenCalledWith(filters);
    expect(bookDTO.mapBookToBookResponseDTO).toHaveBeenCalledTimes(
      books.length
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      totalBooks: total,
      totalPages: 2,
      page: 1,
      limit: 5,
      books: bookResponseDTOs,
      language: "en",
    });
  });

  test("getAllBooks - should return 204 if no books are found", async () => {
    const req = {
      query: {
        page: "1",
        limit: "5",
        title: "Nonexistent Title",
        author: "Unknown Author",
        language: "fr",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      sendStatus: jest.fn(),
    };

    const filters = {
      title: { $regex: /Nonexistent Title/i },
      "authors.name": { $regex: /Unknown Author/i },
      languages: { $in: ["fr"] },
    };

    jest.spyOn(bookService, "getAllBooks").mockResolvedValue([]);
    jest.spyOn(bookService, "countBooks").mockResolvedValue(0);

    await bookController.getAllBooks(req, res);

    expect(bookService.getAllBooks).toHaveBeenCalledWith(
      filters,
      { title: "asc" },
      0,
      5
    );
    expect(bookService.countBooks).toHaveBeenCalledWith(filters);
    expect(res.sendStatus).toHaveBeenCalledWith(204);
  });

  test("getAllBooks - should return 500 on service error", async () => {
    const req = {
      query: {
        page: "1",
        limit: "5",
        title: "Test Title",
        author: "Author Name",
        language: "en",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest
      .spyOn(bookService, "getAllBooks")
      .mockRejectedValue(new Error("Service error"));

    await bookController.getAllBooks(req, res);

    expect(bookService.getAllBooks).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      errorMessage: "Internal Server Error",
    });
  });

  test("getBookById - should return 400 if book ID is missing or invalid", async () => {
    const req = { params: { id: "invalid-id" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await bookController.getBookById(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "Bad Request: Invalid or missing book ID",
    });
  });

  test("getBookById - should return 404 if book is not found", async () => {
    const req = { params: { id: "60e6f965b4d6c9e529c7f0b3" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.spyOn(bookService, "getBookById").mockResolvedValue(null);

    await bookController.getBookById(req, res);

    expect(bookService.getBookById).toHaveBeenCalledWith(
      "60e6f965b4d6c9e529c7f0b3"
    );
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "Book Not Found",
    });
  });

  test("getBookById - should return 200 with book data if book is found", async () => {
    const req = { params: { id: "60e6f965b4d6c9e529c7f0b3" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const bookMock = {
      id: "60e6f965b4d6c9e529c7f0b3",
      title: "Test Book",
      authors: ["Author One", "Author Two"],
    };
    const bookResponseDTO = {
      id: "60e6f965b4d6c9e529c7f0b3",
      title: "Test Book",
      authors: ["Author One", "Author Two"],
    };

    jest.spyOn(bookService, "getBookById").mockResolvedValue(bookMock);
    jest
      .spyOn(bookDTO, "mapBookToBookResponseDTO")
      .mockReturnValue(bookResponseDTO);

    await bookController.getBookById(req, res);

    expect(bookService.getBookById).toHaveBeenCalledWith(
      "60e6f965b4d6c9e529c7f0b3"
    );
    expect(bookDTO.mapBookToBookResponseDTO).toHaveBeenCalledWith(bookMock);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      data: bookResponseDTO,
    });
  });

  test("getBookById - should return 500 on service error", async () => {
    const req = { params: { id: "60e6f965b4d6c9e529c7f0b3" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest
      .spyOn(bookService, "getBookById")
      .mockRejectedValue(new Error("Service error"));

    await bookController.getBookById(req, res);

    expect(bookService.getBookById).toHaveBeenCalledWith(
      "60e6f965b4d6c9e529c7f0b3"
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "Internal Server Error",
    });
  });

  test("incrementDownloads - should return 200 with updated book and mapped DTO", async () => {
    const req = { params: { id: "123" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

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

    const bookResponseDTO = {
      id: "123",
      title: "Test Book",
      authors: ["Author Name"],
      cover: "http://example.com/cover.jpg",
      content: "http://example.com/content.txt",
      downloads: 5,
    };

    jest
      .spyOn(bookService, "incrementDownloads")
      .mockResolvedValue(updatedBook);
    jest
      .spyOn(bookDTO, "mapBookToBookResponseDTO")
      .mockReturnValue(bookResponseDTO);

    await bookController.incrementDownloads(req, res);

    expect(bookService.incrementDownloads).toHaveBeenCalledWith("123");
    expect(bookDTO.mapBookToBookResponseDTO).toHaveBeenCalledWith(updatedBook);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Book downloads incremented successfully",
      book: bookResponseDTO,
    });
  });

  test("incrementDownloads - should return 400 if book ID is missing", async () => {
    const req = { params: {} };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await bookController.incrementDownloads(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      errorMessage: "Book ID is required",
    });
  });

  test("incrementDownloads - should return 404 if book is not found", async () => {
    const req = { params: { id: "123" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest
      .spyOn(bookService, "incrementDownloads")
      .mockRejectedValue(new Error("Book with ID 123 not found"));

    await bookController.incrementDownloads(req, res);

    expect(bookService.incrementDownloads).toHaveBeenCalledWith("123");
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      errorMessage: "Book with ID 123 not found",
    });
  });

  test("incrementDownloads - should return 500 for server error", async () => {
    const req = { params: { id: "123" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest
      .spyOn(bookService, "incrementDownloads")
      .mockRejectedValue(new Error("Internal Server Error"));

    await bookController.incrementDownloads(req, res);

    expect(bookService.incrementDownloads).toHaveBeenCalledWith("123");
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      errorMessage: "Internal Server Error",
    });
  });
});
