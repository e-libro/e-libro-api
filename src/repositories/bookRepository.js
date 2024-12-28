import db from "../models/index.js";

class BookRepository {
  async createBook(book) {
    try {
      return await db.Book.create(book);
    } catch (error) {
      console.error(`Error creating book: ${error}`);
      throw new Error("Failed to create book");
    }
  }

  async findAllBooks(filters, sortBy, page, limit) {
    try {
      return await db.Book.find(filters)
        .sort(sortBy)
        .skip(page * limit)
        .limit(limit)
        .exec();
    } catch (error) {
      console.error(`Error fetching books: ${error}`);
      throw new Error("Failed to fetch books");
    }
  }

  async findBookById(id) {
    try {
      return await db.Book.findById({ _id: id });
    } catch (error) {
      console.error(`Error fetching book: ${error}`);
      throw new Error("Failed to fetch book");
    }
  }

  async findBookByGutenbergId(gutenbergId) {
    try {
      return await db.Book.findOne({ gutenbergId });
    } catch (error) {
      console.error(`Error fetching book: ${error}`);
      throw new Error("Failed to fetch book");
    }
  }

  async updateBook(id, updates) {
    try {
      const doc = await db.Book.findById(id);

      if (!doc) {
        throw new Error(`Book with ID ${id} not found`);
      }

      Object.keys(updates).forEach((update) => {
        doc[update] = updates[update];
      });

      const updatedDoc = await doc.save();
      return await db.Book.findById(updatedDoc._id);
    } catch (error) {
      console.error(`Error updating book: ${error}`);
      throw new Error(`Book with ID ${id} not found`);
    }
  }

  async deleteBook(id) {
    try {
      const deletedBook = await db.Book.findByIdAndDelete({ _id: id });
      if (!deletedBook) {
        throw new Error(`Book with ID ${id} not found`);
      }
      return deletedBook;
    } catch (error) {
      console.error(`Error deleting book: ${error}`);
      throw new Error(`Book with ID ${id} not found`);
    }
  }

  async getDistinctContentTypes() {
    try {
      return await db.Book.getDistinctBookContentTypes();
    } catch (error) {
      console.error(`Error fetching distinct content types: ${error}`);
      throw new Error("Failed to fetch distinct content types");
    }
  }

  async getDistinctBookLanguages() {
    try {
      return await db.Book.getDistinctBookLanguages();
    } catch (error) {
      console.error(`Error fetching distinct languages: ${error}`);
      throw new Error("Failed to fetch distinct languages");
    }
  }

  async incrementDownloads(bookId) {
    try {
      const updatedBook = await db.Book.findByIdAndUpdate(
        bookId,
        { $inc: { downloads: 1 } },
        { new: true, runValidators: true }
      );
      return updatedBook;
    } catch (error) {
      console.error(`Error incrementing downloads: ${error.message}`);
      throw new Error("Failed to increment downloads");
    }
  }
}

export default new BookRepository();
