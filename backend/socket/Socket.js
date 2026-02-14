import http from "http";
import express from "express";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

// Store active users editing notes
// Format: { noteId: { userId: socketId } }
const noteEditorsMap = {};

// Get all users editing a specific note
export const getNoteEditors = (noteId) => {
  return noteEditorsMap[noteId] || {};
};

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  // User joins a note room
  socket.on("join-note", ({ noteId, userId, userName }) => {
    socket.join(noteId);

    // Track this user in the note
    if (!noteEditorsMap[noteId]) {
      noteEditorsMap[noteId] = {};
    }
    noteEditorsMap[noteId][userId] = {
      socketId: socket.id,
      userName: userName,
    };

    // Notify others in the room
    socket.to(noteId).emit("user-joined", {
      userId,
      userName,
      activeUsers: Object.keys(noteEditorsMap[noteId]).length,
    });

    console.log(`📝 User ${userName} joined note: ${noteId}`);
  });

  // User leaves a note room
  socket.on("leave-note", ({ noteId, userId }) => {
    socket.leave(noteId);

    // Remove user from tracking
    if (noteEditorsMap[noteId]) {
      delete noteEditorsMap[noteId][userId];

      // Clean up empty note rooms
      if (Object.keys(noteEditorsMap[noteId]).length === 0) {
        delete noteEditorsMap[noteId];
      }
    }

    // Notify others
    socket.to(noteId).emit("user-left", {
      userId,
      activeUsers: noteEditorsMap[noteId]
        ? Object.keys(noteEditorsMap[noteId]).length
        : 0,
    });

    console.log(`👋 User ${userId} left note: ${noteId}`);
  });

  // Handle real-time note updates
  socket.on("note-update", ({ noteId, content, title, userId, userName }) => {
    // Broadcast to all users in the note room EXCEPT sender
    socket.to(noteId).emit("note-updated", {
      noteId,
      content,
      title,
      userId,
      userName,
      timestamp: new Date().toISOString(),
    });

    console.log(`📤 Note ${noteId} updated by ${userName}`);
  });

  // Typing indicator - user started typing
  socket.on("user-typing", ({ noteId, userId, userName }) => {
    socket.to(noteId).emit("user-typing", {
      userId,
      userName,
    });
  });

  // Typing indicator - user stopped typing
  socket.on("user-stopped-typing", ({ noteId, userId }) => {
    socket.to(noteId).emit("user-stopped-typing", {
      userId,
    });
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    // Remove user from all note rooms
    Object.keys(noteEditorsMap).forEach((noteId) => {
      Object.keys(noteEditorsMap[noteId]).forEach((userId) => {
        if (noteEditorsMap[noteId][userId].socketId === socket.id) {
          delete noteEditorsMap[noteId][userId];

          // Notify others
          socket.to(noteId).emit("user-left", {
            userId,
            activeUsers: Object.keys(noteEditorsMap[noteId]).length,
          });

          // Clean up empty rooms
          if (Object.keys(noteEditorsMap[noteId]).length === 0) {
            delete noteEditorsMap[noteId];
          }
        }
      });
    });

    console.log("❌ User disconnected:", socket.id);
  });
});

export { app, server, io };
