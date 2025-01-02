import db from "../models/index.js";

class BookRepository {
  async findAllBooks(filters, sortBy, page, limit) {
    return await db.Book.find(filters)
      .sort(sortBy)
      .skip(page * limit)
      .limit(limit)
      .exec();
  }

  async findBookById(bookId) {
    return await db.Book.findById({ _id: bookId });
  }

  async findBookByGutenbergId(gutenbergId) {
    return await db.Book.findOne({ gutenbergId });
  }

  async updateBook(bookId, updates) {
    if (!bookId) return null;

    const doc = await db.Book.findById(bookId);

    if (!doc) return null;

    Object.keys(updates).forEach((update) => {
      doc[update] = updates[update];
    });

    const updatedDoc = await doc.save();
    return await db.Book.findById(updatedDoc._id);
  }

  async deleteBook(bookId) {
    const deletedBook = await db.Book.findByIdAndDelete({ _id: bookId });
    if (!deletedBook) return null;
    return deletedBook;
  }

  async incrementDownloads(bookId) {
    if (!bookId) return null;

    const updatedBook = await db.Book.findByIdAndUpdate(
      bookId,
      { $inc: { downloads: 1 } },
      { new: true, runValidators: true }
    );

    if (!updatedBook) return null;
    return updatedBook;
  }

  async countBooks(filters) {
    if (!filters) return null;
    const total = await db.Book.countDocuments(filters);
    return total;
  }
}

export default new BookRepository();
