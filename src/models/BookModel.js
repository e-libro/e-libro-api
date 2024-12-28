import mongoose from "mongoose";

const { Schema, model } = mongoose;

const bookSchema = new Schema(
  {
    gutenbergId: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    authors: [
      {
        name: { type: String, required: true },
        birthYear: { type: Number },
        deathYear: { type: Number },
      },
    ],
    translators: [
      {
        name: { type: String, required: true },
        birthYear: { type: Number },
        deathYear: { type: Number },
      },
    ],
    type: { type: String, required: true },
    subjects: [{ type: String }],
    languages: [{ type: String }],
    formats: [
      {
        contentType: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
    downloads: { type: Number },
    bookShelves: [{ type: String }],
    copyright: { type: Boolean },
  },
  { collection: "books" }
);

bookSchema.methods.getFormatUrlByContentType = function (contentType) {
  const format = this.formats.find((f) => f.contentType === contentType);
  return format ? format.url : null;
};

bookSchema.statics.getDistinctBookContentTypes = async function () {
  const distinctBookContentTypes = await this.aggregate([
    { $unwind: "$formats" },
    { $group: { _id: "$formats.contentType" } },
    { $sort: { _id: 1 } },
  ]);
  return distinctBookContentTypes.map((item) => item._id);
};

bookSchema.statics.getDistinctBookLanguages = async function () {
  const distinctBookLanguages = await this.aggregate([
    { $unwind: "$languages" },
    { $group: { _id: "$languages" } },
    { $sort: { _id: 1 } },
  ]);
  return distinctBookLanguages.map((item) => item._id);
};

const Book = mongoose.models.Book || mongoose.model("Book", bookSchema);
export default Book;
