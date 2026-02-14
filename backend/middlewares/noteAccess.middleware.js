import Note from "../models/note.model.js";

// ============================================
// CHECK NOTE OWNER - Only note owner can proceed
// ============================================
export const checkNoteOwner = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    // Check if user is the owner
    if (note.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied - Only the owner can perform this action",
      });
    }

    // Attach note to request so controller doesn't need to fetch again
    req.note = note;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error checking note ownership",
      error: error.message,
    });
  }
};

// ============================================
// CHECK NOTE EDITOR - Owner or Editor can proceed
// ============================================
export const checkNoteEditor = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id)
      .populate("owner", "name email")
      .populate("collaborators.user", "name email");

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    // Check if user is the owner
    if (note.owner._id.toString() === req.user._id.toString()) {
      req.note = note;
      req.userRole = "owner";
      return next();
    }

    // Check if user is a collaborator with editor role
    const collaborator = note.collaborators.find(
      (c) => c.user._id.toString() === req.user._id.toString(),
    );

    if (collaborator && collaborator.role === "editor") {
      req.note = note;
      req.userRole = "editor";
      return next();
    }

    // User doesn't have editor access
    return res.status(403).json({
      success: false,
      message:
        "Access denied - You need editor permission to perform this action",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error checking editor permission",
      error: error.message,
    });
  }
};

// ============================================
// CHECK NOTE VIEWER - Owner, Editor, or Viewer can proceed
// ============================================
export const checkNoteViewer = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id)
      .populate("owner", "name email")
      .populate("collaborators.user", "name email");

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    // Check if user is the owner
    if (note.owner._id.toString() === req.user._id.toString()) {
      req.note = note;
      req.userRole = "owner";
      return next();
    }

    // Check if user is a collaborator (viewer or editor)
    const collaborator = note.collaborators.find(
      (c) => c.user._id.toString() === req.user._id.toString(),
    );

    if (collaborator) {
      req.note = note;
      req.userRole = collaborator.role;
      return next();
    }

    // User doesn't have any access
    return res.status(403).json({
      success: false,
      message: "Access denied - You don't have permission to view this note",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error checking view permission",
      error: error.message,
    });
  }
};
