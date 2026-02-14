import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchNoteById, updateNote, clearCurrentNote } from "../features/notes/notesSlice";
import useSocket from "../hooks/useSocket";
import CollaboratorPanel from "../components/CollaboratorPanel";
import ShareModal from "../components/ShareModal";
import TypingIndicator from "../components/TypingIndicator";
import toast from "react-hot-toast";

const NoteEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentNote, userRole, activeUsers, loading } = useSelector((state) => state.notes);
  const { user } = useSelector((state) => state.auth);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saveStatus, setSaveStatus] = useState("saved");
  const [showShare, setShowShare] = useState(false);
  const [showPanel, setShowPanel] = useState(false); // default closed on mobile
  const saveTimerRef = useRef(null);
  const typingTimerRef = useRef(null);

  const { emitNoteUpdate, emitTyping, emitStoppedTyping } = useSocket(id);
  const canEdit = userRole === "owner" || userRole === "editor";

  useEffect(() => {
    dispatch(fetchNoteById(id));
    return () => { dispatch(clearCurrentNote()); };
  }, [id, dispatch]);

  useEffect(() => {
    if (currentNote) { setTitle(currentNote.title || ""); setContent(currentNote.content || ""); }
  }, [currentNote?._id]);

  useEffect(() => {
    if (currentNote) { setTitle(currentNote.title || ""); setContent(currentNote.content || ""); }
  }, [currentNote?.title, currentNote?.content]);

  const handleChange = useCallback((field, value) => {
    if (field === "title") setTitle(value);
    if (field === "content") setContent(value);
    setSaveStatus("unsaved");
    emitNoteUpdate({ title: field === "title" ? value : title, content: field === "content" ? value : content });
    emitTyping();
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => { emitStoppedTyping(); }, 2000);
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      setSaveStatus("saving");
      const result = await dispatch(updateNote({ id, data: { title: field === "title" ? value : title, content: field === "content" ? value : content } }));
      setSaveStatus(updateNote.fulfilled.match(result) ? "saved" : "unsaved");
    }, 600);
  }, [title, content, id, dispatch, emitNoteUpdate, emitTyping, emitStoppedTyping]);

  const getInitials = (name) => name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  const saveStatusColors = { saved: "text-emerald-400", saving: "text-yellow-400", unsaved: "text-[#888899]" };
  const saveStatusLabels = { saved: "✓ Saved", saving: "Saving...", unsaved: "Unsaved" };

  if (loading && !currentNote) {
    return (
      <div className="min-h-screen bg-[#0f0f13] flex items-center justify-center">
        <div className="text-[#888899] font-mono text-sm animate-pulse">Loading note...</div>
      </div>
    );
  }

  if (!currentNote) return null;

  return (
    <div className="h-screen bg-[#0f0f13] flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="h-14 bg-[#18181f] border-b border-[#2e2e3e] flex items-center px-3 md:px-4 gap-2 md:gap-3 flex-shrink-0">
        <button onClick={() => navigate("/")} className="text-[#888899] hover:text-white text-sm transition-colors flex-shrink-0">
          ← <span className="hidden sm:inline">Back</span>
        </button>

        <div className="w-px h-5 bg-[#2e2e3e] flex-shrink-0" />

        {/* Title input */}
        <input
          type="text"
          value={title}
          onChange={(e) => handleChange("title", e.target.value)}
          disabled={!canEdit}
          className="flex-1 min-w-0 bg-transparent text-white font-semibold text-sm focus:outline-none placeholder-[#555566] disabled:opacity-60 truncate"
          placeholder="Note title..."
        />

        {/* Save status */}
        <span className={`text-xs font-mono flex-shrink-0 hidden sm:inline ${saveStatusColors[saveStatus]}`}>
          {saveStatusLabels[saveStatus]}
        </span>

        {/* Active users — hidden on very small screens */}
        {activeUsers.length > 0 && (
          <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
            <div className="flex -space-x-1">
              {activeUsers.slice(0, 3).map((u, i) => (
                <div key={i} title={u.userName} className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-[#ff6584] border-2 border-[#18181f] flex items-center justify-center text-white text-[9px] font-bold">
                  {getInitials(u.userName)}
                </div>
              ))}
            </div>
            <span className="text-[#888899] text-xs hidden md:inline">{activeUsers.length} online</span>
          </div>
        )}

        {/* Role badge */}
        <span className={`text-xs border rounded-full px-2 py-0.5 font-mono flex-shrink-0 hidden sm:inline ${
          userRole === "owner" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          : userRole === "editor" ? "bg-[#6c63ff]/10 text-[#6c63ff] border-[#6c63ff]/20"
          : "bg-orange-500/10 text-orange-400 border-orange-500/20"
        }`}>
          {userRole}
        </span>

        {/* Share button */}
        {userRole === "owner" && (
          <button onClick={() => setShowShare(true)} className="bg-[#6c63ff] hover:bg-[#5a52e0] text-white text-xs font-medium px-2.5 md:px-3 py-1.5 rounded-lg transition-colors flex-shrink-0">
            Share
          </button>
        )}

        {/* Panel toggle */}
        <button onClick={() => setShowPanel((p) => !p)} className={`text-lg transition-colors flex-shrink-0 ${showPanel ? "text-[#6c63ff]" : "text-[#888899] hover:text-white"}`} title="Toggle panel">
          ⊞
        </button>
      </div>

      {/* Editor + Panel */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <textarea
            value={content}
            onChange={(e) => handleChange("content", e.target.value)}
            disabled={!canEdit}
            placeholder={canEdit ? "Start writing your note..." : "This note is read-only for you."}
            className="flex-1 bg-[#0f0f13] text-[#e8e8f0] text-sm leading-relaxed resize-none focus:outline-none p-4 md:p-6 disabled:opacity-60 font-mono"
            style={{ caretColor: "#6c63ff" }}
          />
          <div className="h-8 px-4 md:px-6 flex items-center border-t border-[#1a1a22]">
            <TypingIndicator />
          </div>
        </div>

        {/* Right panel — slide in on mobile as overlay, fixed on desktop */}
        {showPanel && (
          <>
            {/* Mobile backdrop */}
            <div
              className="md:hidden fixed inset-0 bg-black/40 z-10"
              onClick={() => setShowPanel(false)}
            />
            {/* Panel */}
            <div className="
              fixed md:relative
              right-0 top-14 bottom-0
              w-72 md:w-64 xl:w-72
              flex-shrink-0
              bg-[#18181f] border-l border-[#2e2e3e]
              overflow-y-auto
              z-20 md:z-auto
              shadow-2xl md:shadow-none
            ">
              <div className="p-4">
                {/* Mobile close */}
                <div className="flex items-center justify-between mb-3 md:hidden">
                  <span className="text-[#888899] text-xs uppercase tracking-wider font-mono">Panel</span>
                  <button onClick={() => setShowPanel(false)} className="text-[#888899] hover:text-white text-sm">✕</button>
                </div>

                <CollaboratorPanel />

                <div className="mt-5 pt-4 border-t border-[#2e2e3e] flex flex-col gap-1">
                  <p className="text-[#888899] text-xs uppercase tracking-wider font-mono mb-2">ℹ Info</p>
                  <p className="text-[#555566] text-xs">Created: <span className="text-[#888899]">{new Date(currentNote.createdAt).toLocaleDateString()}</span></p>
                  <p className="text-[#555566] text-xs">Updated: <span className="text-[#888899]">{new Date(currentNote.updatedAt).toLocaleDateString()}</span></p>
                  {currentNote.isPublic && <p className="text-yellow-400 text-xs mt-1 font-mono">🌐 Publicly shared</p>}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {showShare && <ShareModal onClose={() => setShowShare(false)} />}
    </div>
  );
};

export default NoteEditorPage;