import mongoose from "mongoose";
import Book from "./BookModel.js";
import User from "./UserModel.js";

mongoose.Promise = global.Promise;

const db = {
  mongoose: mongoose,
  Book: Book,
  User: User,
};

export default db;
