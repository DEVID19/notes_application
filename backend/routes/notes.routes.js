import express from "express";
import {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
  searchNotes,
} from "../controllers/note.controllers.js";
import {
  removeCollaborator,
  updateCollaboratorRole,
  generateShareLink,
  disableShareLink,
  getPublicNote,
  addCollaborator,
} from "../controllers/collaborator.controllers.js";
import {
  checkNoteOwner,
  checkNoteEditor,
  checkNoteViewer,
} from "../middlewares/noteAccess.middleware.js";
import { Auth } from "../middlewares/auth.middleware.js";

const notesRouter = express.Router();

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================
// GET /api/notes/public/:token - View public note
notesRouter.get("/public/:token", getPublicNote);

// ============================================
// SEARCH ROUTE (Must be before /:id)
// ============================================
// GET /api/notes/search?q=keyword
notesRouter.get("/search", Auth, searchNotes);

// ============================================
// GET ALL NOTES
// ============================================
// GET /api/notes/all
notesRouter.get("/all", Auth, getNotes);

// ============================================
// CREATE NOTE
// ============================================
// POST /api/notes/create
notesRouter.post("/create", Auth, createNote);

// ============================================
// SINGLE NOTE OPERATIONS
// ============================================

// GET /api/notes/:id - View note
// Access: Owner, Editor, Viewer
notesRouter.get("/view/:id", Auth, checkNoteViewer, getNoteById);

// PUT /api/notes/:id - Update note
// Access: Owner, Editor only
notesRouter.put("/update/:id", Auth, checkNoteEditor, updateNote);

// DELETE /api/notes/:id - Delete note
// Access: Owner only
notesRouter.delete("/delete/:id", Auth, checkNoteOwner, deleteNote);

// ============================================
// COLLABORATOR MANAGEMENT (Owner only)
// ============================================

// POST /api/notes/:id/collaborators - Add collaborator
// Access: Owner only
notesRouter.post(
  "/addCollaborators/:id/collaborators",
  Auth,
  checkNoteOwner,
  addCollaborator,
);

// DELETE /api/notes/:id/collaborators/:userId - Remove collaborator
// Access: Owner only
notesRouter.delete(
  "/removeCollaborators/:id/collaborators/:userId",
  Auth,
  checkNoteOwner,
  removeCollaborator,
);

// PUT /api/notes/:id/collaborators/:userId - Update collaborator role
// Access: Owner only
notesRouter.put(
  "/updateCollaborators/:id/collaborators/:userId",
  Auth,
  checkNoteOwner,
  updateCollaboratorRole,
);

// ============================================
// PUBLIC SHARING (Owner only)
// ============================================

// POST /api/notes/:id/share - Generate public share link
// Access: Owner only
notesRouter.post("/:id/share", Auth, checkNoteOwner, generateShareLink);

// DELETE /api/notes/:id/share - Disable public sharing
// Access: Owner only
notesRouter.delete("/:id/share", Auth, checkNoteOwner, disableShareLink);

export default notesRouter;
