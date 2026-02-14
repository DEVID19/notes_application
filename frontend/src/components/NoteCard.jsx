import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { deleteNote } from "../features/notes/notesSlice";
import toast from "react-hot-toast";

// Formats "2024-01-15T10:30:00Z" → "2h ago" or "3 days ago"
const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

// Role badge colors
const roleBadge = {
  owner: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  editor: "bg-[#6c63ff]/10 text-[#6c63ff] border-[#6c63ff]/20",
  viewer: "bg-orange-500/10 text-orange-400 border-orange-500/20",
};

const NoteCard = ({ note, userRole }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Determine role: if this user is the owner, show "owner", else check collaborators
  const getRole = () => {
    if (note.owner._id === user?._id || note.owner === user?._id) return "owner";
    const collab = note.collaborators?.find(
      (c) => c.user._id === user?._id || c.user === user?._id
    );
    return collab?.role || "viewer";
  };

  const role = getRole();

  const handleDelete = async (e) => {
    e.stopPropagation(); // don't navigate when clicking delete
    if (!window.confirm("Delete this note?")) return;
    const result = await dispatch(deleteNote(note._id));
    if (deleteNote.fulfilled.match(result)) {
      toast.success("Note deleted");
    }
  };

  // Preview: first 80 chars of content stripped of extra spaces
  const preview = note.content?.replace(/\n/g, " ").slice(0, 80) || "No content yet...";

  return (
    <div
      onClick={() => navigate(`/notes/${note._id}`)}
      className="bg-[#18181f] border border-[#2e2e3e] rounded-xl p-4 cursor-pointer hover:border-[#6c63ff]/50 hover:bg-[#1c1c25] transition-all duration-200 group flex flex-col gap-3"
    >
      {/* Top: title + delete button */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-white font-semibold text-sm leading-tight line-clamp-2 flex-1">
          {note.title}
        </h3>
        {role === "owner" && (
          <button
            onClick={handleDelete}
            className="text-[#555566] hover:text-[#ff6584] opacity-0 group-hover:opacity-100 transition-opacity text-base flex-shrink-0 mt-0.5"
            title="Delete note"
          >
            🗑
          </button>
        )}
      </div>

      {/* Content preview */}
      <p className="text-[#555566] text-xs leading-relaxed line-clamp-2">{preview}</p>

      {/* Bottom: role badge + collaborators + time */}
      <div className="flex items-center justify-between mt-auto">
        <span className={`text-xs border rounded-full px-2 py-0.5 font-mono ${roleBadge[role]}`}>
          {role}
        </span>
        <div className="flex items-center gap-2">
          {/* Collaborator avatars */}
          {note.collaborators?.length > 0 && (
            <div className="flex -space-x-1">
              {note.collaborators.slice(0, 3).map((c, i) => (
                <div
                  key={i}
                  className="w-5 h-5 rounded-full bg-[#6c63ff] border border-[#18181f] flex items-center justify-center text-white text-[8px] font-bold"
                  title={c.user?.name}
                >
                  {c.user?.name?.[0]?.toUpperCase() || "?"}
                </div>
              ))}
            </div>
          )}
          <span className="text-[#555566] text-xs">{timeAgo(note.updatedAt)}</span>
        </div>
      </div>

      {/* Public badge */}
      {note.isPublic && (
        <div className="text-[10px] text-[#888899] font-mono flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block"></span>
          publicly shared
        </div>
      )}
    </div>
  );
};

export default NoteCard;