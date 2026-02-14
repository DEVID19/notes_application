import Note from "../models/note.model.js";


export const createNote = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    const note = await Note.create({
      title,
      content: content || "",
      owner: req.user._id,
    });

    const populatedNote = await Note.findById(note._id)
      .populate("owner", "name email")
      .populate("collaborators.user", "name email");

    res.status(201).json({
      success: true,
      message: "Note created successfully",
      note: populatedNote,
    });
  } catch (error) {
    console.error("Create note error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getNotes = async (req, res) => {
  try {
    const notes = await Note.find({
      $or: [{ owner: req.user._id }, { "collaborators.user": req.user._id }],
    })
      .populate("owner", "name email")
      .populate("collaborators.user", "name email")
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: notes.length,
      notes,
    });
  } catch (error) {
    console.error("Get notes error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getNoteById = async (req, res) => {
  try {
    // Note is already fetched and checked by middleware
    // Available in req.note
    res.status(200).json({
      success: true,
      note: req.note,
      userRole: req.userRole, // owner, editor, or viewer
    });
  } catch (error) {
    console.error("Get note error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const updateNote = async (req, res) => {
  try {
    const { title, content } = req.body;

    // Note is already fetched by middleware
    const note = req.note;

    // Update fields
    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;

    await note.save();

    // Populate and return
    const updatedNote = await Note.findById(note._id)
      .populate("owner", "name email")
      .populate("collaborators.user", "name email");

    res.status(200).json({
      success: true,
      message: "Note updated successfully",
      note: updatedNote,
    });
  } catch (error) {
    console.error("Update note error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const deleteNote = async (req, res) => {
  try {
    // Note is already fetched by middleware
    // Only owner can reach here (middleware blocks others)
    await req.note.deleteOne();

    res.status(200).json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.error("Delete note error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const searchNotes = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const notes = await Note.find({
      $and: [
        {
          $or: [
            { owner: req.user._id },
            { "collaborators.user": req.user._id },
          ],
        },
        {
          $or: [
            { title: { $regex: q, $options: "i" } },
            { content: { $regex: q, $options: "i" } },
          ],
        },
      ],
    })
      .populate("owner", "name email")
      .populate("collaborators.user", "name email")
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: notes.length,
      searchQuery: q,
      notes,
    });
  } catch (error) {
    console.error("Search notes error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
