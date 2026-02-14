import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
// ⭐ Import app and server from socket.js (NOT create new express app)
import { app, server } from "./socket/Socket.js";

import authRouter from "./routes/auth.routes.js";
import notesRouter from "./routes/notes.routes.js";
import connectDb from "./config/db.js";

dotenv.config();
const port = process.env.PORT || 5000;

// ============================================
// MIDDLEWARE
// ============================================
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

// ============================================
// ROUTES
// ============================================
app.use("/api/auth", authRouter);
app.use("/api/notes", notesRouter);

// Health check route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "✅ Notes API with Socket.io is running!",
  });
});

// ============================================
// START SERVER (Use server from socket.js, NOT app.listen)
// ============================================
server.listen(port, () => {
  connectDb();
  console.log(`🚀 Server is running on port ${port}`);
  console.log(`🔌 Socket.io is ready for real-time collaboration`);
});
