// useSocket.js — manages the Socket.io connection for a single note
// This hook is used inside NoteEditorPage.
// It connects to the socket, joins the note room, and dispatches Redux
// actions when real-time events come in from other users.

import { useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";
import {
  userJoined,
  userLeft,
  noteUpdatedByPeer,
  userStartedTyping,
  userStoppedTyping,
} from "../features/notes/notesSlice";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:8000";
const useSocket = (noteId) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const socketRef = useRef(null); // keeps the socket instance across re-renders

  useEffect(() => {
    if (!noteId || !user) return;

    // Create socket connection
    socketRef.current = io(SOCKET_URL, {
      withCredentials: true,
    });

    const socket = socketRef.current;

    // Tell the server: "I'm joining this note's room"
    socket.emit("join-note", {
      noteId,
      userId: user._id,
      userName: user.name,
    });

    // Someone else joined → add them to activeUsers in Redux
    socket.on("user-joined", (data) => {
      dispatch(userJoined({ userId: data.userId, userName: data.userName }));
    });

    // Someone left → remove from activeUsers
    socket.on("user-left", (data) => {
      dispatch(userLeft({ userId: data.userId }));
    });

    // Another user saved/updated the note → update our editor content
    socket.on("note-updated", (data) => {
      dispatch(noteUpdatedByPeer({ content: data.content, title: data.title }));
    });

    // Someone started typing → show their name in typing indicator
    socket.on("user-typing", (data) => {
      dispatch(
        userStartedTyping({ userId: data.userId, userName: data.userName }),
      );
    });

    // Someone stopped typing → hide indicator
    socket.on("user-stopped-typing", (data) => {
      dispatch(userStoppedTyping({ userId: data.userId }));
    });

    // Cleanup: when leaving the note page, disconnect and leave room
    return () => {
      socket.emit("leave-note", { noteId, userId: user._id });
      socket.disconnect();
    };
  }, [noteId, user, dispatch]);

  // Call this when the LOCAL user makes a change — broadcasts to others
  const emitNoteUpdate = useCallback(
    ({ content, title }) => {
      if (socketRef.current && noteId) {
        socketRef.current.emit("note-update", {
          noteId,
          content,
          title,
          userId: user?._id,
          userName: user?.name,
        });
      }
    },
    [noteId, user],
  );

  // Call this when local user starts typing
  const emitTyping = useCallback(() => {
    if (socketRef.current && noteId) {
      socketRef.current.emit("user-typing", {
        noteId,
        userId: user?._id,
        userName: user?.name,
      });
    }
  }, [noteId, user]);

  // Call this when local user stops typing
  const emitStoppedTyping = useCallback(() => {
    if (socketRef.current && noteId) {
      socketRef.current.emit("user-stopped-typing", {
        noteId,
        userId: user?._id,
      });
    }
  }, [noteId, user]);

  return { emitNoteUpdate, emitTyping, emitStoppedTyping };
};

export default useSocket;
