import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../features/auth/authSlice";
import { createNote } from "../features/notes/notesSlice";
import toast from "react-hot-toast";

const Sidebar = ({ onSearch }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [mobileOpen, setMobileOpen] = useState(false);

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const handleNewNote = async () => {
    const result = await dispatch(createNote({ title: "Untitled Note", content: "" }));
    if (createNote.fulfilled.match(result)) {
      navigate(`/notes/${result.payload._id}`);
      toast.success("New note created!");
      setMobileOpen(false);
    }
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/login");
    toast.success("Logged out successfully");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-[#2e2e3e] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6c63ff] to-[#ff6584] flex items-center justify-center text-sm flex-shrink-0">📝</div>
          <span className="text-white font-bold text-base">CollabNotes</span>
        </div>
        <button onClick={() => setMobileOpen(false)} className="md:hidden text-[#888899] hover:text-white text-xl">✕</button>
      </div>

      <div className="p-3">
        <button onClick={handleNewNote} className="w-full bg-[#6c63ff] hover:bg-[#5a52e0] text-white text-sm font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
          <span>+</span> New Note
        </button>
      </div>

      <nav className="flex-1 px-3 flex flex-col gap-1">
        <button onClick={() => { navigate("/"); setMobileOpen(false); }} className="w-full text-left px-3 py-2.5 rounded-lg text-[#888899] hover:text-white hover:bg-[#22222d] transition-colors text-sm flex items-center gap-2">
          <span>📋</span> All Notes
        </button>
        <button onClick={() => { onSearch(); setMobileOpen(false); }} className="w-full text-left px-3 py-2.5 rounded-lg text-[#888899] hover:text-white hover:bg-[#22222d] transition-colors text-sm flex items-center gap-2">
          <span>🔍</span> Search
        </button>
      </nav>

      <div className="p-3 border-t border-[#2e2e3e]">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#22222d] cursor-pointer group">
          <div className="w-8 h-8 rounded-full bg-[#6c63ff] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{getInitials(user?.name)}</div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">{user?.name}</p>
            <p className="text-[#555566] text-xs truncate">{user?.email}</p>
          </div>
          <button onClick={handleLogout} className="text-[#555566] hover:text-[#ff6584] text-xs opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity" title="Logout">⏻</button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:flex w-56 xl:w-64 flex-shrink-0 bg-[#18181f] border-r border-[#2e2e3e] h-screen flex-col">
        <SidebarContent />
      </div>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-[#18181f] border-b border-[#2e2e3e] h-12 flex items-center px-4 gap-3">
        <button onClick={() => setMobileOpen(true)} className="text-[#888899] hover:text-white text-xl">☰</button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#6c63ff] to-[#ff6584] flex items-center justify-center text-xs">📝</div>
          <span className="text-white font-bold text-sm">CollabNotes</span>
        </div>
        <div className="flex-1" />
        <button onClick={handleNewNote} className="bg-[#6c63ff] hover:bg-[#5a52e0] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">+ New</button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative w-72 max-w-[85vw] bg-[#18181f] h-full flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;