import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import { app, server } from "./socket/Socket.js";

import authRouter from "./routes/auth.routes.js";
import notesRouter from "./routes/notes.routes.js";
import connectDb from "./config/db.js";

dotenv.config();
const port = process.env.PORT || 5000;

//* for dev
// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     credentials: true,
//   }),
// );
//* for Production

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/notes", notesRouter);

// Health check route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: " Notes API with Socket.io is running!",
  });
});

server.listen(port, () => {
  connectDb();
  console.log(` Server is running on port ${port}`);
  console.log(`Socket.io is ready for real-time collaboration`);
});
