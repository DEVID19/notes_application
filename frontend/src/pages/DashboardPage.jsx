import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchNotes, searchNotes, clearSearch } from "../features/notes/notesSlice";
import Sidebar from "../components/Sidebar";
import NoteCard from "../components/NoteCard";

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { notes, searchResults, loading } = useSelector((state) => state.notes);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    dispatch(fetchNotes());
  }, [dispatch]);

  useEffect(() => {
    if (!searchQuery.trim()) { dispatch(clearSearch()); return; }
    const timer = setTimeout(() => { dispatch(searchNotes(searchQuery)); }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, dispatch]);

  const displayNotes = searchResults !== null ? searchResults : notes;

  const handleSearchToggle = () => {
    setShowSearch((prev) => !prev);
    if (showSearch) { setSearchQuery(""); dispatch(clearSearch()); }
  };

  return (
    <div className="flex h-screen bg-[#0f0f13] overflow-hidden">
      <Sidebar onSearch={handleSearchToggle} />

      {/* Main content — add top padding on mobile for fixed top bar */}
      <div className="flex-1 flex flex-col overflow-hidden pt-12 md:pt-0">
        {/* Top bar */}
        <div className="h-14 border-b border-[#2e2e3e] bg-[#18181f] flex items-center px-4 md:px-6 gap-3 flex-shrink-0">
          <h2 className="text-white font-semibold text-sm flex-1 truncate">
            {searchResults !== null
              ? `Results: "${searchQuery}" (${searchResults.length})`
              : `All Notes (${notes.length})`}
          </h2>
          {showSearch && (
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              autoFocus
              className="bg-[#0f0f13] border border-[#2e2e3e] rounded-lg px-3 py-1.5 text-white placeholder-[#555566] focus:outline-none focus:border-[#6c63ff] text-sm w-40 sm:w-56 md:w-64 transition-colors"
            />
          )}
          {/* Search toggle button — visible on all sizes */}
          <button
            onClick={handleSearchToggle}
            className="md:hidden text-[#888899] hover:text-white text-lg"
          >
            {showSearch ? "✕" : "🔍"}
          </button>
        </div>

        {/* Notes grid */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-[#18181f] border border-[#2e2e3e] rounded-xl p-4 h-32 animate-pulse" />
              ))}
            </div>
          ) : displayNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-4">
              <div className="text-5xl md:text-6xl">📝</div>
              <h3 className="text-white font-semibold text-base md:text-lg">
                {searchResults !== null ? "No notes found" : "No notes yet"}
              </h3>
              <p className="text-[#888899] text-sm max-w-xs">
                {searchResults !== null
                  ? "Try a different search term"
                  : "Click '+ New Note' to create your first note"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayNotes.map((note) => (
                <NoteCard key={note._id} note={note} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;