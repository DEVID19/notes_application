// CollaboratorPanel — shown on right side of the note editor
// Owner can add/remove collaborators from here
// State used: state.notes.currentNote.collaborators, state.auth.user (to check if owner)

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addCollaborator, removeCollaborator } from "../features/notes/notesSlice";
import toast from "react-hot-toast";

const CollaboratorPanel = () => {
  const dispatch = useDispatch();
  const { currentNote } = useSelector((state) => state.notes);
  const { user } = useSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("viewer");
  const [adding, setAdding] = useState(false);

  // Only the owner sees the add form
  const isOwner =
    currentNote?.owner?._id === user?._id ||
    currentNote?.owner === user?._id;

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setAdding(true);
    const result = await dispatch(
      addCollaborator({ noteId: currentNote._id, email, role })
    );
    setAdding(false);
    if (addCollaborator.fulfilled.match(result)) {
      toast.success("Collaborator added!");
      setEmail("");
    } else {
      toast.error(result.payload);
    }
  };

  const handleRemove = async (userId, userName) => {
    if (!window.confirm(`Remove ${userName} from this note?`)) return;
    const result = await dispatch(
      removeCollaborator({ noteId: currentNote._id, userId })
    );
    if (removeCollaborator.fulfilled.match(result)) {
      toast.success("Collaborator removed");
    }
  };

  if (!currentNote) return null;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[#888899] text-xs uppercase tracking-wider font-mono">
        👥 Collaborators
      </p>

      {/* Owner */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-[#6c63ff] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {currentNote.owner?.name?.[0]?.toUpperCase() || "?"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-xs font-medium truncate">
            {currentNote.owner?.name}
          </p>
          <p className="text-[#555566] text-[10px] truncate">
            {currentNote.owner?.email}
          </p>
        </div>
        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full px-2 py-0.5 font-mono">
          owner
        </span>
      </div>

      {/* Collaborators list */}
      {currentNote.collaborators?.map((c) => (
        <div key={c.user._id || c.user} className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#ff6584] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {c.user?.name?.[0]?.toUpperCase() || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">{c.user?.name}</p>
            <p className="text-[#555566] text-[10px] truncate">{c.user?.email}</p>
          </div>
          <span
            className={`text-[10px] rounded-full px-2 py-0.5 font-mono border ${
              c.role === "editor"
                ? "bg-[#6c63ff]/10 text-[#6c63ff] border-[#6c63ff]/20"
                : "bg-orange-500/10 text-orange-400 border-orange-500/20"
            }`}
          >
            {c.role}
          </span>
          {isOwner && (
            <button
              onClick={() => handleRemove(c.user._id || c.user, c.user?.name)}
              className="text-[#555566] hover:text-[#ff6584] text-xs transition-colors"
              title="Remove"
            >
              ✕
            </button>
          )}
        </div>
      ))}

      {/* Add collaborator form (owner only) */}
      {isOwner && (
        <form onSubmit={handleAdd} className="flex flex-col gap-2 mt-1 pt-3 border-t border-[#2e2e3e]">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@email.com"
            className="bg-[#0f0f13] border border-[#2e2e3e] rounded-lg px-3 py-2 text-white placeholder-[#555566] focus:outline-none focus:border-[#6c63ff] text-xs"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="bg-[#0f0f13] border border-[#2e2e3e] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-[#6c63ff]"
          >
            <option value="viewer">Viewer</option>
            <option value="editor">Editor</option>
          </select>
          <button
            type="submit"
            disabled={adding}
            className="bg-[#6c63ff]/20 hover:bg-[#6c63ff]/30 text-[#6c63ff] text-xs font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {adding ? "Adding..." : "+ Add Collaborator"}
          </button>
        </form>
      )}
    </div>
  );
};

export default CollaboratorPanel;