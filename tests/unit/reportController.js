import { jest } from "@jest/globals";
import reportController from "../../src/controllers/reportController.js";
import ApiError from "../../src/errors/ApiError.js";
import db from "../../src/models/index.js";

describe("ReportController", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getTopBooksReport", () => {
    test("should return top books report with percentages", async () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      const booksMock = [
        { _id: "1", title: "Book One", downloads: 100 },
        { _id: "2", title: "Book Two", downloads: 50 },
        { _id: "3", title: "Book Three", downloads: 25 },
      ];

      jest.spyOn(db.Book, "find").mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(booksMock),
      });

      await reportController.getTopBooksReport(req, res, next);

      const totalDownloads = 175;
      const enrichedBooks = [
        {
          id: "1",
          title: "Book One",
          downloads: 100,
          percentage: "57.14",
        },
        {
          id: "2",
          title: "Book Two",
          downloads: 50,
          percentage: "28.57",
        },
        {
          id: "3",
          title: "Book Three",
          downloads: 25,
          percentage: "14.29",
        },
      ];

      expect(db.Book.find).toHaveBeenCalledWith({});
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        message: "Report data retrieved successfully",
        data: enrichedBooks,
        error: null,
      });
    });

    test("should call next with ApiError.InternalServerError on failure", async () => {
      const req = {};
      const res = {};
      const next = jest.fn();

      jest.spyOn(db.Book, "find").mockImplementation(() => {
        throw new Error("Database error");
      });

      await reportController.getTopBooksReport(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Failed to load top books data",
          code: 500,
        })
      );
    });
  });
});
