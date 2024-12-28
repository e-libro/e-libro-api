import { jest } from "@jest/globals";
import { connect, clearDatabase, closeDatabase } from "../dbHandler.js";
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

describe("Pruebas para el modelo Book", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Debe lanzar un error si falta el título al validar un libro", async () => {
    const invalidBook = new Book({
      gutenbergId: 12345,
      authors: [{ name: "Author Name" }],
      type: "Fiction",
    });

    try {
      await invalidBook.validate();
    } catch (error) {
      expect(error.errors.title.message).toBe("Path `title` is required.");
    }
  });

  test("Debe lanzar un error si falta el gutenbergId al validar un libro", async () => {
    const invalidBook = new Book({
      title: "Test Book",
      authors: [{ name: "Author Name" }],
      type: "Fiction",
    });

    try {
      await invalidBook.validate();
    } catch (error) {
      expect(error.errors.gutenbergId.message).toBe(
        "Path `gutenbergId` is required."
      );
    }
  });

  test("Debe retornar la URL correcta para un tipo de formato dado", async () => {
    const book = new Book({
      gutenbergId: 12345,
      title: "Test Book",
      authors: [{ name: "Author Name" }],
      type: "Fiction",
      formats: [
        { contentType: "application/pdf", url: "http://example.com/pdf" },
        { contentType: "text/plain", url: "http://example.com/txt" },
      ],
    });

    const url = book.getFormatUrlByContentType("application/pdf");

    expect(url).toBe("http://example.com/pdf");
  });

  test("Debe retornar null si el tipo de formato no existe", async () => {
    const book = new Book({
      gutenbergId: 12345,
      title: "Test Book",
      authors: [{ name: "Author Name" }],
      type: "Fiction",
      formats: [
        { contentType: "application/pdf", url: "http://example.com/pdf" },
      ],
    });

    const url = book.getFormatUrlByContentType("text/plain");

    expect(url).toBeNull();
  });

  test("Debe retornar los tipos de contenido distintos", async () => {
    const book1 = new Book({
      gutenbergId: 12345,
      title: "Book 1",
      authors: [{ name: "Author 1" }],
      type: "Fiction",
      formats: [
        { contentType: "application/pdf", url: "http://example.com/pdf1" },
        { contentType: "text/plain", url: "http://example.com/txt1" },
      ],
    });

    const book2 = new Book({
      gutenbergId: 12346,
      title: "Book 2",
      authors: [{ name: "Author 2" }],
      type: "Non-fiction",
      formats: [
        { contentType: "application/pdf", url: "http://example.com/pdf2" },
        { contentType: "text/html", url: "http://example.com/html2" },
      ],
    });

    await book1.save();
    await book2.save();

    const distinctBookContentTypes = await Book.getDistinctBookContentTypes();

    expect(distinctBookContentTypes).toEqual([
      "application/pdf",
      "text/html",
      "text/plain",
    ]);
  });

  test("Debe retornar los idiomas distintos", async () => {
    const book1 = new Book({
      gutenbergId: 12345,
      title: "Book 1",
      authors: [{ name: "Author 1" }],
      type: "Fiction",
      languages: ["en", "fr"],
    });

    const book2 = new Book({
      gutenbergId: 12346,
      title: "Book 2",
      authors: [{ name: "Author 2" }],
      type: "Non-fiction",
      languages: ["en", "es"],
    });

    await book1.save();
    await book2.save();

    const distinctBookLanguages = await Book.getDistinctBookLanguages();

    expect(distinctBookLanguages).toEqual(["en", "es", "fr"]);
  });
});
