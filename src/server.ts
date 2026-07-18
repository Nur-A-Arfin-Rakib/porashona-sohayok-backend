import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { connectDB } from "./config/db";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server চলছে http://localhost:${PORT} এ (${process.env.NODE_ENV || "development"} mode)`);
  });
};

startServer();
