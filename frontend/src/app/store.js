import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import notesReducer from "../features/notes/notesSlice";

const store = configureStore({
  reducer: {
    auth: authReducer, // state.auth.user, state.auth.isAuthenticated, ...
    notes: notesReducer, // state.notes.notes, state.notes.currentNote, ...
  },
});

export default store;
