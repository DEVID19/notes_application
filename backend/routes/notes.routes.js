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

notesRouter.get("/public/:token", getPublicNote);

notesRouter.get("/search", Auth, searchNotes);

notesRouter.get("/all", Auth, getNotes);

notesRouter.post("/create", Auth, createNote);

notesRouter.get("/view/:id", Auth, checkNoteViewer, getNoteById);

notesRouter.put("/update/:id", Auth, checkNoteEditor, updateNote);

notesRouter.delete("/delete/:id", Auth, checkNoteOwner, deleteNote);

notesRouter.post(
  "/addCollaborators/:id/collaborators",
  Auth,
  checkNoteOwner,
  addCollaborator,
);

notesRouter.delete(
  "/removeCollaborators/:id/collaborators/:userId",
  Auth,
  checkNoteOwner,
  removeCollaborator,
);

notesRouter.put(
  "/updateCollaborators/:id/collaborators/:userId",
  Auth,
  checkNoteOwner,
  updateCollaboratorRole,
);

notesRouter.post("/:id/share", Auth, checkNoteOwner, generateShareLink);
notesRouter.delete("/:id/share", Auth, checkNoteOwner, disableShareLink);

export default notesRouter;
