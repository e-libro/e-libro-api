class BookDTO {
  urlContentTypes = [
    "text/plain",
    "text/plain; charset=big5",
    "text/plain; charset=iso-8859-1",
    "text/plain; charset=iso-8859-15",
    "text/plain; charset=iso-8859-2",
    "text/plain; charset=iso-8859-3",
    "text/plain; charset=iso-8859-7",
    "text/plain; charset=us-ascii",
    "text/plain; charset=utf-16",
    "text/plain; charset=utf-8",
    "text/plain; charset=windows-1250",
    "text/plain; charset=windows-1251",
    "text/plain; charset=windows-1252",
    "text/plain; charset=windows-1253",
  ];

  imageContentTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/tiff",
    "image/svg+xml",
  ];

  static BookResponseDTO = class {
    constructor(id, gutenbergId, title, authors, cover, content, downloads) {
      this.id = id;
      this.gutenbergId = gutenbergId;
      this.title = title;
      this.authors = authors;
      this.cover = cover;
      this.content = content;
      this.donwloads = downloads;
    }
  };

  mapBookToBookResponseDTO(book) {
    if (!book) {
      throw new Error("Book entity is required");
    }

    return new BookDTO.BookResponseDTO(
      book._id,
      book.gutenbergId,
      book.title,
      book.authors,
      this.findFirstMatchingFormat(book, this.imageContentTypes) || null,
      this.findFirstMatchingFormat(book, this.urlContentTypes) || null,
      book.downloads
    );
  }

  findFirstMatchingFormat(book, validContentTypes) {
    if (!book || !Array.isArray(book.formats)) {
      throw new Error(
        "El objeto book debe tener un campo 'formats' que sea un array."
      );
    }

    if (!Array.isArray(validContentTypes) || validContentTypes.length === 0) {
      throw new Error("Debes proporcionar un array de contentTypes válidos.");
    }

    return (
      book.formats.find((format) =>
        validContentTypes.includes(format.contentType)
      ) || null
    );
  }
}

export default new BookDTO();
