import express from "express";
import cors from "cors";
import rateLimiter from "express-rate-limit";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import db from "./models/index.js";
import { authRouter, bookRouter, userRouter } from "./routes/v1/index.js";

let httpServer;

dotenv.config();

const PORT = process.env.PORT || 3000;
const DB_URL = process.env.DB_URL;

const server = express();

const corsOptions = {
  origin: [
    "http://10.0.2.2",
    "http://192.168.100.4",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
};

const limiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: "Ha sobre pasado su límite de peticiones.",
});

server.use(helmet());
server.use(cors(corsOptions));

server.use(limiter);

server.use(express.json());
server.use(cookieParser());

server.use(authRouter);
server.use(bookRouter);
server.use(userRouter);

server.use((req, res, next) => {
  res.status(404).json({
    errorMessage: "Not Found: The requested resource could not be found",
  });
});

server.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    errorMessage: "Internal Server Error: An unexpected error occurred",
  });
});

const startServer = async () => {
  try {
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
