import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axios";


export const fetchNotes = createAsyncThunk(
  "notes/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/notes/all");
      return res.data.notes;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch notes",
      );
    }
  },
);

// GET /api/notes/view/:id — fetch one note to open in editor
export const fetchNoteById = createAsyncThunk(
  "notes/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/notes/view/${id}`);
      return res.data; // { note, userRole }
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch note",
      );
    }
  },
);

// POST /api/notes/create — create a new note
export const createNote = createAsyncThunk(
  "notes/create",
  async (noteData, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/notes/create", noteData);
      return res.data.note;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to create note",
      );
    }
  },
);

// PUT /api/notes/update/:id — save note title/content
export const updateNote = createAsyncThunk(
  "notes/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/notes/update/${id}`, data);
      return res.data.note;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update note",
      );
    }
  },
);

// DELETE /api/notes/delete/:id — delete a note (owner only)
export const deleteNote = createAsyncThunk(
  "notes/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/notes/delete/${id}`);
      return id; // return id so we can remove it from the list
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete note",
      );
    }
  },
);

// GET /api/notes/search?q=... — search notes
export const searchNotes = createAsyncThunk(
  "notes/search",
  async (query, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/notes/search?q=${query}`);
      return res.data.notes;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Search failed");
    }
  },
);

// POST /api/notes/addCollaborators/:id/collaborators
export const addCollaborator = createAsyncThunk(
  "notes/addCollaborator",
  async ({ noteId, email, role }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(
        `/notes/addCollaborators/${noteId}/collaborators`,
        { email, role },
      );
      return res.data.note;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to add collaborator",
      );
    }
  },
);

// DELETE /api/notes/removeCollaborators/:id/collaborators/:userId
export const removeCollaborator = createAsyncThunk(
  "notes/removeCollaborator",
  async ({ noteId, userId }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.delete(
        `/notes/removeCollaborators/${noteId}/collaborators/${userId}`,
      );
      return res.data.note;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to remove collaborator",
      );
    }
  },
);

// POST /api/notes/:id/share — generate public share link
export const generateShareLink = createAsyncThunk(
  "notes/generateShare",
  async (noteId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(`/notes/${noteId}/share`);
      return res.data; // { shareUrl, token }
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to generate link",
      );
    }
  },
);

// DELETE /api/notes/:id/share — disable public link
export const disableShareLink = createAsyncThunk(
  "notes/disableShare",
  async (noteId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/notes/${noteId}/share`);
      return noteId;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to disable link",
      );
    }
  },
);

// GET /api/notes/public/:token — public view, no auth
export const fetchPublicNote = createAsyncThunk(
  "notes/fetchPublic",
  async (token, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/notes/public/${token}`);
      return res.data.note;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Note not found");
    }
  },
);


const initialState = {
  notes: [], // all notes list shown on dashboard
  currentNote: null, // the note currently open in the editor
  userRole: null, // "owner" | "editor" | "viewer" — controls what UI to show
  shareUrl: null, // public share link after generating

  // Real-time from Socket.io (NOT from API — updated by useSocket hook)
  activeUsers: [], // [{ userId, userName }] currently in the same note room
  typingUsers: [], // [{ userId, userName }] currently typing

  loading: false,
  error: null,
  searchResults: null, // null = not searching, [] = searched but empty
};


const notesSlice = createSlice({
  name: "notes",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentNote: (state) => {
      // called when leaving editor page so old note doesn't flash on next open
      state.currentNote = null;
      state.userRole = null;
      state.activeUsers = [];
      state.typingUsers = [];
      state.shareUrl = null;
    },
    clearSearch: (state) => {
      state.searchResults = null;
    },

    // ── Socket.io actions (called by useSocket hook, not by API) ──

    // When someone joins the same note room
    userJoined: (state, action) => {
      const { userId, userName } = action.payload;
      // avoid duplicates
      const exists = state.activeUsers.find((u) => u.userId === userId);
      if (!exists) {
        state.activeUsers.push({ userId, userName });
      }
    },
    // When someone leaves
    userLeft: (state, action) => {
      state.activeUsers = state.activeUsers.filter(
        (u) => u.userId !== action.payload.userId,
      );
      // also remove from typing if they left
      state.typingUsers = state.typingUsers.filter(
        (u) => u.userId !== action.payload.userId,
      );
    },
    // When socket receives a note update from another user
    noteUpdatedByPeer: (state, action) => {
      const { content, title } = action.payload;
      if (state.currentNote) {
        if (content !== undefined) state.currentNote.content = content;
        if (title !== undefined) state.currentNote.title = title;
      }
    },
    // Typing indicator on
    userStartedTyping: (state, action) => {
      const { userId, userName } = action.payload;
      const exists = state.typingUsers.find((u) => u.userId === userId);
      if (!exists) state.typingUsers.push({ userId, userName });
    },
    // Typing indicator off
    userStoppedTyping: (state, action) => {
      state.typingUsers = state.typingUsers.filter(
        (u) => u.userId !== action.payload.userId,
      );
    },
  },

  extraReducers: (builder) => {
    // ── FETCH ALL NOTES ──
    builder
      .addCase(fetchNotes.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotes.fulfilled, (state, action) => {
        state.loading = false;
        state.notes = action.payload;
      })
      .addCase(fetchNotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── FETCH SINGLE NOTE ──
    builder
      .addCase(fetchNoteById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNoteById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentNote = action.payload.note;
        state.userRole = action.payload.userRole;
      })
      .addCase(fetchNoteById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── CREATE NOTE ──
    builder.addCase(createNote.fulfilled, (state, action) => {
      // prepend new note to the top of the list
      state.notes.unshift(action.payload);
    });

    // ── UPDATE NOTE ──
    builder.addCase(updateNote.fulfilled, (state, action) => {
      state.currentNote = action.payload;
      // also update in the notes list so dashboard reflects new title
      const idx = state.notes.findIndex((n) => n._id === action.payload._id);
      if (idx !== -1) state.notes[idx] = action.payload;
    });

    // ── DELETE NOTE ──
    builder.addCase(deleteNote.fulfilled, (state, action) => {
      state.notes = state.notes.filter((n) => n._id !== action.payload);
    });

    // ── SEARCH ──
    builder.addCase(searchNotes.fulfilled, (state, action) => {
      state.searchResults = action.payload;
    });

    // ── ADD / REMOVE COLLABORATOR ── both return updated note
    builder
      .addCase(addCollaborator.fulfilled, (state, action) => {
        state.currentNote = action.payload;
      })
      .addCase(removeCollaborator.fulfilled, (state, action) => {
        state.currentNote = action.payload;
      });

    // ── GENERATE SHARE LINK ──
    builder.addCase(generateShareLink.fulfilled, (state, action) => {
      state.shareUrl = action.payload.shareUrl;
      if (state.currentNote) state.currentNote.isPublic = true;
    });

    // ── DISABLE SHARE LINK ──
    builder.addCase(disableShareLink.fulfilled, (state) => {
      state.shareUrl = null;
      if (state.currentNote) {
        state.currentNote.isPublic = false;
        state.currentNote.publicToken = null;
      }
    });

    // ── PUBLIC NOTE ──
    builder
      .addCase(fetchPublicNote.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPublicNote.fulfilled, (state, action) => {
        state.loading = false;
        state.currentNote = action.payload;
      })
      .addCase(fetchPublicNote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearCurrentNote,
  clearSearch,
  userJoined,
  userLeft,
  noteUpdatedByPeer,
  userStartedTyping,
  userStoppedTyping,
} = notesSlice.actions;

export default notesSlice.reducer;
