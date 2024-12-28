import { jest } from "@jest/globals";
import bookController from "../../src/controllers/bookController.js";
import bookService from "../../src/services/bookService.js";
import bookDTO from "../../src/dtos/bookDTO.js";

describe("bookController", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("getAllBooks - should return 200 with books if they exist", async () => {
    const req = {
      query: {
        page: "1",
        limit: "5",
        title: "Test Title",
        authors: "Author Name",
        languages: "en",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const books = [
      { id: "1", title: "Test Title", authors: [{ name: "Author Name" }] },
      {
        id: "2",
        title: "Another Title",
        authors: [{ name: "Another Author" }],
      },
    ];
    const bookResponseDTOs = books.map((book) => ({
      id: book.id,
      title: book.title,
      authors: book.authors.map((author) => author.name),
    }));

    const languagesOptions = ["en", "es", "fr"];

    jest
      .spyOn(bookService, "getDistinctBookLanguages")
      .mockResolvedValue(languagesOptions);
    jest.spyOn(bookService, "getAllBooks").mockResolvedValue(books);
    jest
      .spyOn(bookDTO, "mapBookToBookResponseDTO")
      .mockImplementation((book) => ({
        id: book.id,
        title: book.title,
        authors: book.authors.map((author) => author.name),
      }));

    await bookController.getAllBooks(req, res);

    expect(bookService.getDistinctBookLanguages).toHaveBeenCalled();
    expect(bookService.getAllBooks).toHaveBeenCalledWith(
      {
        languages: { $in: ["en"] },
        $or: [
          { title: { $regex: /Test Title/i } },
          { "authors.name": { $regex: /^Author Name/i } },
        ],
      },
      { title: "asc" },
      0,
      5
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      totalBooks: 2,
      totalPages: 1,
      page: 1,
      limit: 5,
      languages: ["en"],
      books: bookResponseDTOs,
    });
  });
  test("getAllBooks - should return 204 if no books are found", async () => {
    const req = {
      query: {
        page: "1",
        limit: "5",
        title: "Non-existent Title",
        authors: "Unknown Author",
        languages: "fr",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const languagesOptions = ["en", "es", "fr"];

    jest
      .spyOn(bookService, "getDistinctBookLanguages")
      .mockResolvedValue(languagesOptions);
    jest.spyOn(bookService, "getAllBooks").mockResolvedValue([]);

    await bookController.getAllBooks(req, res);

    expect(bookService.getDistinctBookLanguages).toHaveBeenCalled();
    expect(bookService.getAllBooks).toHaveBeenCalledWith(
      {
        languages: { $in: ["fr"] },
        $or: [
          { title: { $regex: /Non-existent Title/i } },
          { "authors.name": { $regex: /^Unknown Author/i } },
        ],
      },
      { title: "asc" },
      0,
      5
    );
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.json).toHaveBeenCalledWith({
      message: "No content",
    });
  });

  test("getBookById - should return 200 with the book if found", async () => {
    const req = { params: { id: "123" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const book = {
      id: "123",
      title: "Test Title",
      authors: [{ name: "Author Name" }],
    };

    const bookResponseDTO = {
      id: "123",
      title: "Test Title",
      authors: ["Author Name"],
    };

    jest.spyOn(bookService, "getBookById").mockResolvedValue(book);

    jest
      .spyOn(bookDTO, "mapBookToBookResponseDTO")
      .mockReturnValue(bookResponseDTO);

    await bookController.getBookById(req, res);

    expect(bookService.getBookById).toHaveBeenCalledWith("123");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      book: bookResponseDTO,
    });
  });

  test("getBookById - should return 404 if the book is not found", async () => {
    const req = { params: { id: "123" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.spyOn(bookService, "getBookById").mockResolvedValue(null);

    await bookController.getBookById(req, res);

    expect(bookService.getBookById).toHaveBeenCalledWith("123");
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      errorMessage: "Book Not Found",
    });
  });

  // incrementDownloads
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
