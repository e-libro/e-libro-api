import { jest } from "@jest/globals";
import bookController from "../../src/controllers/bookController.js";
import bookService from "../../src/services/bookService.js";
import bookDTO from "../../src/dtos/bookDTO.js";
import ApiError from "../../src/errors/ApiError.js";
import mongoose from "mongoose";

afterEach(() => {
  jest.clearAllMocks();
});

describe("BookController", () => {
  describe("BookController - getAllBooks", () => {
    let req, res, next;

    beforeEach(() => {
      req = {
        query: {},
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      next = jest.fn();

      jest.clearAllMocks();
    });

    test("should return books with filters and pagination", async () => {
      req.query = {
        page: "1",
        limit: "5",
        title: "Test",
        author: "Author",
        language: "en",
      };

      const booksMock = [
        { id: "1", title: "Test Book", downloads: 50 },
        { id: "2", title: "Another Test", downloads: 30 },
      ];

      const bookResponseDTOs = [
        { id: "1", title: "Test Book", downloads: 50 },
        { id: "2", title: "Another Test", downloads: 30 },
      ];

      jest.spyOn(bookService, "getAllBooks").mockResolvedValue(booksMock);
      jest.spyOn(bookService, "countBooks").mockResolvedValue(10);
      jest
        .spyOn(bookDTO, "mapBookToBookResponseDTO")
        .mockImplementation((book) => book);

      await bookController.getAllBooks(req, res, next);

      expect(bookService.getAllBooks).toHaveBeenCalledWith(
        {
          $and: [
            { languages: { $in: ["en"] } },
            {
              $or: [
                { title: { $regex: new RegExp("Test", "i") } },
                { "authors.name": { $regex: new RegExp("Author", "i") } },
              ],
            },
          ],
        },
        { title: "asc" },
        0,
        5
      );

      expect(bookService.countBooks).toHaveBeenCalledWith({
        $and: [
          { languages: { $in: ["en"] } },
          {
            $or: [
              { title: { $regex: new RegExp("Test", "i") } },
              { "authors.name": { $regex: new RegExp("Author", "i") } },
            ],
          },
        ],
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        message: "Books retrieved successfully",
        data: {
          totalDocuments: 10,
          totalPages: 2,
          page: 1,
          limit: 5,
          documents: bookResponseDTOs,
          language: "en",
        },
        error: null,
      });
    });

    test("should handle not found error when no books are retrieved", async () => {
      req.query = {
        page: "1",
        limit: "5",
        language: "en",
      };

      jest.spyOn(bookService, "getAllBooks").mockResolvedValue([]);

      await bookController.getAllBooks(req, res, next);

      expect(bookService.getAllBooks).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Not Found",
          code: 404,
        })
      );
    });

    test("should call next with error if an exception occurs", async () => {
      req.query = { page: "1", limit: "5" };
      const error = new Error("Database error");

      jest.spyOn(bookService, "getAllBooks").mockRejectedValue(error);

      await bookController.getAllBooks(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("BookController.getBookById", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    test("should throw 400 if book ID is invalid", async () => {
      const req = { params: { id: "invalid-id" } };
      const res = {};
      const next = jest.fn();

      await bookController.getBookById(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next.mock.calls[0][0].message).toBe("Invalid or missing book ID");
      expect(next.mock.calls[0][0].code).toBe(400);
    });

    test("should call next with NotFound error if book is not found", async () => {
      const req = { params: { id: "60e6f965b4d6c9e529c7f0b3" } };
      const res = {};
      const next = jest.fn();

      jest.spyOn(bookService, "getBookById").mockResolvedValue(null);

      await bookController.getBookById(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next.mock.calls[0][0].message).toBe("Not Found");
      expect(next.mock.calls[0][0].code).toBe(404);
    });

    test("should return 200 with book data if book is found", async () => {
      const req = { params: { id: "60e6f965b4d6c9e529c7f0b3" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      const bookMock = { id: "60e6f965b4d6c9e529c7f0b3", title: "Test Book" };
      const bookResponseDTO = {
        id: "60e6f965b4d6c9e529c7f0b3",
        title: "Test Book",
      };

      jest.spyOn(bookService, "getBookById").mockResolvedValue(bookMock);
      jest
        .spyOn(bookDTO, "mapBookToBookResponseDTO")
        .mockReturnValue(bookResponseDTO);

      await bookController.getBookById(req, res, next);

      expect(bookService.getBookById).toHaveBeenCalledWith(
        "60e6f965b4d6c9e529c7f0b3"
      );
      expect(bookDTO.mapBookToBookResponseDTO).toHaveBeenCalledWith(bookMock);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "success",
          message: "Book retrieved successfully",
          data: bookResponseDTO,
          error: null,
        })
      );
    });

    test("should pass errors to next middleware on failure", async () => {
      const req = { params: { id: "60e6f965b4d6c9e529c7f0b3" } };
      const res = {};
      const next = jest.fn();

      jest
        .spyOn(bookService, "getBookById")
        .mockRejectedValue(new Error("Service error"));

      await bookController.getBookById(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toBe("Service error");
    });
  });

  describe("BookController.incrementDownloads", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    test("should return 200 with updated book data if successful", async () => {
      const req = { params: { id: "60e6f965b4d6c9e529c7f0b3" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      const updatedBookMock = {
        _id: "60e6f965b4d6c9e529c7f0b3",
        gutenbergId: "12345",
        title: "Test Book",
        authors: ["Author One", "Author Two"],
        formats: [
          { contentType: "image/jpeg", url: "http://example.com/cover.jpg" },
          { contentType: "text/plain", url: "http://example.com/content.txt" },
        ],
        downloads: 10,
      };

      const bookResponseDTO = {
        id: "60e6f965b4d6c9e529c7f0b3",
        gutenbergId: "12345",
        title: "Test Book",
        authors: ["Author One", "Author Two"],
        cover: "http://example.com/cover.jpg",
        content: "http://example.com/content.txt",
        downloads: 10,
      };

      jest
        .spyOn(bookService, "incrementDownloads")
        .mockResolvedValue(updatedBookMock);
      jest
        .spyOn(bookDTO, "mapBookToBookResponseDTO")
        .mockReturnValue(bookResponseDTO);

      await bookController.incrementDownloads(req, res, next);

      expect(bookService.incrementDownloads).toHaveBeenCalledWith(
        "60e6f965b4d6c9e529c7f0b3"
      );
      expect(bookDTO.mapBookToBookResponseDTO).toHaveBeenCalledWith(
        updatedBookMock
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "success",
          message: "Book downloads incremented successfully",
          data: bookResponseDTO,
          error: null,
        })
      );
    });

    test("should throw 400 if book ID is missing", async () => {
      const req = { params: {} };
      const res = {};
      const next = jest.fn();

      await bookController.incrementDownloads(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next.mock.calls[0][0].message).toBe("Invalid or missing book ID");
      expect(next.mock.calls[0][0].code).toBe(400);
    });

    test("should pass errors to next middleware on failure", async () => {
      const req = { params: { id: "60e6f965b4d6c9e529c7f0b3" } };
      const res = {};
      const next = jest.fn();

      jest
        .spyOn(bookService, "incrementDownloads")
        .mockRejectedValue(new Error("Service error"));

      await bookController.incrementDownloads(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toBe("Service error");
    });
  });
});
