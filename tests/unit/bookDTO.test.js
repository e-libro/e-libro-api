import { jest } from "@jest/globals";
import bookDTO from "../../src/dtos/bookDTO.js";

describe("BookDTO", () => {
  test("mapBookToBookResponseDTO - should map book entity to BookResponseDTO correctly", () => {
    const book = {
      _id: "123456",
      gutenbergId: "123",
      title: "Test Book",
      authors: ["Author One", "Author Two"],
      downloads: 42,
      formats: [
        { contentType: "image/jpeg", url: "http://example.com/cover.jpg" },
        { contentType: "text/plain", url: "http://example.com/content.txt" },
      ],
    };

    const result = bookDTO.mapBookToBookResponseDTO(book);

    expect(result).toEqual({
      id: "123456",
      gutenbergId: "123",
      title: "Test Book",
      authors: ["Author One", "Author Two"],
      cover: { contentType: "image/jpeg", url: "http://example.com/cover.jpg" },
      content: {
        contentType: "text/plain",
        url: "http://example.com/content.txt",
      },
      downloads: 42,
    });
  });

  test("mapBookToBookResponseDTO - should throw error if book entity is missing", () => {
    expect(() => bookDTO.mapBookToBookResponseDTO(null)).toThrow(
      "Book entity is required"
    );
  });

  test("findFirstMatchingFormat - should return correct format URL based on content types", () => {
    const book = {
      formats: [
        { contentType: "image/jpeg", url: "http://example.com/cover.jpg" },
        { contentType: "text/plain", url: "http://example.com/content.txt" },
      ],
    };

    const result = bookDTO.findFirstMatchingFormat(
      book,
      bookDTO.urlContentTypes
    );

    expect(result).toEqual({
      contentType: "text/plain",
      url: "http://example.com/content.txt",
    });
  });

  test("findFirstMatchingFormat - should throw error if formats field is missing", () => {
    const book = {};

    expect(() =>
      bookDTO.findFirstMatchingFormat(book, bookDTO.urlContentTypes)
    ).toThrow("El objeto book debe tener un campo 'formats' que sea un array.");
  });

  test("findFirstMatchingFormat - should throw error if valid content types are missing", () => {
    const book = {
      formats: [
        { contentType: "image/jpeg", url: "http://example.com/cover.jpg" },
      ],
    };

    expect(() => bookDTO.findFirstMatchingFormat(book, null)).toThrow(
      "Debes proporcionar un array de contentTypes válidos."
    );
  });
});
