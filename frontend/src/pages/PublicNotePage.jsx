import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPublicNote,
  clearCurrentNote,
} from "../features/notes/notesSlice";

const PublicNotePage = () => {
  const { token } = useParams();
  const dispatch = useDispatch();
  const { currentNote, loading, error } = useSelector((state) => state.notes);

  useEffect(() => {
    dispatch(fetchPublicNote(token));
    return () => dispatch(clearCurrentNote());
  }, [token, dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f13] flex items-center justify-center px-4">
        <p className="text-[#888899] font-mono text-sm animate-pulse">
          Loading note...
        </p>
      </div>
    );
  }

  if (error || !currentNote) {
    return (
      <div className="min-h-screen bg-[#0f0f13] flex flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="text-5xl">🔒</div>
        <h2 className="text-white font-semibold text-lg">Note not found</h2>
        <p className="text-[#888899] text-sm">
          This link may have been disabled or doesn't exist.
        </p>
        <Link
          to="/login"
          className="text-[#6c63ff] hover:underline text-sm font-medium mt-2"
        >
          Sign in to CollabNotes →
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f13] pb-20">
      {/* Top bar */}
      <div className="bg-[#18181f] border-b border-[#2e2e3e] px-4 md:px-6 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#6c63ff] to-[#ff6584] flex items-center justify-center text-sm flex-shrink-0">
            📝
          </div>
          <span className="text-white font-bold text-sm flex-shrink-0 hidden sm:inline">
            CollabNotes
          </span>
          <div className="w-px h-4 bg-[#2e2e3e] flex-shrink-0 hidden sm:block" />
          <h1 className="text-white font-semibold text-sm truncate">
            {currentNote.title}
          </h1>
        </div>
        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
          <span className="text-xs bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 rounded-full px-2 md:px-3 py-1 font-mono hidden sm:inline">
            👁 Read Only
          </span>
          <Link
            to="/signup"
            className="bg-[#6c63ff] hover:bg-[#5a52e0] text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
          >
            Sign up free
          </Link>
        </div>
      </div>

      {/* Note content */}
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 md:py-10">
        <p className="text-[#555566] text-xs font-mono mb-6">
          Shared by{" "}
          <span className="text-[#888899]">{currentNote.owner?.name}</span> ·
          Last updated {new Date(currentNote.updatedAt).toLocaleDateString()}
        </p>
        <div className="text-[#e8e8f0] text-sm leading-relaxed whitespace-pre-wrap font-mono">
          {currentNote.content || "This note has no content."}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="fixed bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 w-[90vw] max-w-sm">
        <Link
          to="/signup"
          className="block text-center bg-[#18181f] border border-[#2e2e3e] hover:border-[#6c63ff] text-white text-xs font-medium px-5 py-2.5 rounded-full transition-colors shadow-lg"
        >
          Create your own notes with CollabNotes →
        </Link>
      </div>
    </div>
  );
};

export default PublicNotePage;
