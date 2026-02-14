import Note from "../models/note.model.js";
import User from "../models/user.model.js";
import crypto from "crypto";


export const addCollaborator = async (req, res) => {
  try {
    const { email, role } = req.body;

    // Validation
    if (!email || !role) {
      return res.status(400).json({
        success: false,
        message: "Email and role are required",
      });
    }

    if (!["viewer", "editor"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be 'viewer' or 'editor'",
      });
    }

    // Note is already fetched by middleware
    const note = req.note;

    // Find user by email
    const collaboratorUser = await User.findOne({ email });

    if (!collaboratorUser) {
      return res.status(404).json({
        success: false,
        message: "User not found with this email",
      });
    }

    // Check if user is trying to add themselves
    if (note.owner.toString() === collaboratorUser._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You are already the owner of this note",
      });
    }

    // Check if user is already a collaborator
    const existingCollaborator = note.collaborators.find(
      (c) => c.user.toString() === collaboratorUser._id.toString()
    );

    if (existingCollaborator) {
      return res.status(400).json({
        success: false,
        message: "User is already a collaborator on this note",
      });
    }

    // Add collaborator
    note.collaborators.push({
      user: collaboratorUser._id,
      role,
    });

    await note.save();

    // Return updated note with populated fields
    const updatedNote = await Note.findById(note._id)
      .populate("owner", "name email")
      .populate("collaborators.user", "name email");

    res.status(200).json({
      success: true,
      message: `${collaboratorUser.name} added as ${role}`,
      note: updatedNote,
    });
  } catch (error) {
    console.error("Add collaborator error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const removeCollaborator = async (req, res) => {
  try {
    const { userId } = req.params;

    // Note is already fetched by middleware
    const note = req.note;

    // Check if user is actually a collaborator
    const collaboratorExists = note.collaborators.find(
      (c) => c.user.toString() === userId
    );

    if (!collaboratorExists) {
      return res.status(404).json({
        success: false,
        message: "User is not a collaborator on this note",
      });
    }

    // Remove collaborator
    note.collaborators = note.collaborators.filter(
      (c) => c.user.toString() !== userId
    );

    await note.save();

    // Return updated note
    const updatedNote = await Note.findById(note._id)
      .populate("owner", "name email")
      .populate("collaborators.user", "name email");

    res.status(200).json({
      success: true,
      message: "Collaborator removed successfully",
      note: updatedNote,
    });
  } catch (error) {
    console.error("Remove collaborator error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const updateCollaboratorRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!role || !["viewer", "editor"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be 'viewer' or 'editor'",
      });
    }

    // Note is already fetched by middleware
    const note = req.note;

    // Find the collaborator
    const collaborator = note.collaborators.find(
      (c) => c.user.toString() === userId
    );

    if (!collaborator) {
      return res.status(404).json({
        success: false,
        message: "User is not a collaborator on this note",
      });
    }

    // Update role
    collaborator.role = role;
    await note.save();

    // Return updated note
    const updatedNote = await Note.findById(note._id)
      .populate("owner", "name email")
      .populate("collaborators.user", "name email");

    res.status(200).json({
      success: true,
      message: `Collaborator role updated to ${role}`,
      note: updatedNote,
    });
  } catch (error) {
    console.error("Update collaborator role error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const generateShareLink = async (req, res) => {
  try {
    // Note is already fetched by middleware
    const note = req.note;

    // Generate unique token
    const token = crypto.randomBytes(32).toString("hex");
    
    note.publicToken = token;
    note.isPublic = true;

    await note.save();

    const shareUrl = `${process.env.CLIENT_URL}/shared/${token}`;

    res.status(200).json({
      success: true,
      message: "Share link generated successfully",
      shareUrl,
      token,
    });
  } catch (error) {
    console.error("Generate share link error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const disableShareLink = async (req, res) => {
  try {
    // Note is already fetched by middleware
    const note = req.note;

    note.isPublic = false;
    note.publicToken = null;

    await note.save();

    res.status(200).json({
      success: true,
      message: "Public access disabled",
    });
  } catch (error) {
    console.error("Disable share link error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getPublicNote = async (req, res) => {
  try {
    const { token } = req.params;

    const note = await Note.findOne({ 
      publicToken: token,
      isPublic: true 
    })
      .populate("owner", "name email")
      .select("-collaborators"); // Don't expose collaborators in public view

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found or not publicly accessible",
      });
    }

    res.status(200).json({
      success: true,
      note,
      readOnly: true, // Indicate this is read-only
    });
  } catch (error) {
    console.error("Get public note error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};