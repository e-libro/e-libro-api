import express from "express";
import cors from "cors";

import helmet from "helmet";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import db from "./models/index.js";
import { authRouter, bookRouter, userRouter } from "./routes/v1/index.js";
import morgan from "morgan";
import logger from "./logger/logger.js";
import ApiError from "./errors/ApiError.js";
import { apiErrorHandler } from "./middlewares/index.js";

const ENV = process.env.NODE_ENV || "development";
const CORS_ORIGIN = process.env.CORS_ORIGIN;
const FORMAT = ENV === "production" ? "combined" : "dev";
const PORT = process.env.PORT || 8083;
const DB_URL = process.env.DB_URL || "mongodb://localhost:27017/e-libro";

console.log("CORS_ORIGIN", CORS_ORIGIN);

let httpServer;

dotenv.config();

const server = express();

server.use(morgan(FORMAT, { write: (message) => logger.info(message.trim()) }));

server.use(express.json());
server.use(cookieParser());
server.use(helmet());
server.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  })
);

server.use(authRouter);
server.use(bookRouter);
server.use(userRouter);

server.use((req, res, next) => {
  next(ApiError.NotFound("The requested resource could not be found"));
});

server.use(apiErrorHandler);

const startServer = async () => {
  try {
    console.log(process.env.NODE_ENV);
    await db.mongoose.connect(DB_URL, {});
    console.log(`Connected to MongoDB on ${DB_URL}.`);
    httpServer = server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Connection error", err);
    process.exit(1);
  }
};

const stopServer = async () => {
  await db.mongoose.disconnect();
  console.log("Database connection close.");
  if (httpServer) {
    return new Promise((resolve, reject) => {
      httpServer.close((err) => {
        if (err) return reject(err);
        console.log("Server has been stopped.");
        resolve();
      });
    });
  }
};

export { server, startServer, stopServer };
