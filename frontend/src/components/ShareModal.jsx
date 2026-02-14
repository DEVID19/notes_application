// ShareModal — generates or disables the public read-only link
// State used: state.notes.shareUrl, state.notes.currentNote.isPublic

import { useDispatch, useSelector } from "react-redux";
import { generateShareLink, disableShareLink } from "../features/notes/notesSlice";
import toast from "react-hot-toast";

const ShareModal = ({ onClose }) => {
  const dispatch = useDispatch();
  const { currentNote, shareUrl } = useSelector((state) => state.notes);

  const displayUrl =
    shareUrl ||
    (currentNote?.isPublic && currentNote?.publicToken
      ? `${window.location.origin}/shared/${currentNote.publicToken}`
      : null);

  const handleGenerate = async () => {
    const result = await dispatch(generateShareLink(currentNote._id));
    if (generateShareLink.fulfilled.match(result)) {
      toast.success("Share link generated!");
    }
  };

  const handleDisable = async () => {
    const result = await dispatch(disableShareLink(currentNote._id));
    if (disableShareLink.fulfilled.match(result)) {
      toast.success("Public access disabled");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(displayUrl);
    toast.success("Link copied to clipboard!");
  };

  return (
    // Overlay
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      <div
        className="bg-[#18181f] border border-[#2e2e3e] rounded-2xl p-6 w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()} // don't close when clicking inside
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-semibold text-base">🔗 Share Note</h3>
          <button onClick={onClose} className="text-[#888899] hover:text-white text-lg">
            ✕
          </button>
        </div>

        <p className="text-[#888899] text-sm mb-4">
          Generate a public read-only link. Anyone with the link can view this note
          without logging in.
        </p>

        {displayUrl ? (
          // Link is active
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 bg-[#0f0f13] border border-[#2e2e3e] rounded-lg p-3">
              <p className="text-[#888899] text-xs font-mono flex-1 truncate">
                {displayUrl}
              </p>
              <button
                onClick={handleCopy}
                className="text-[#6c63ff] text-xs font-medium hover:underline flex-shrink-0"
              >
                Copy
              </button>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCopy}
                className="flex-1 bg-[#6c63ff] hover:bg-[#5a52e0] text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
              >
                Copy Link
              </button>
              <button
                onClick={handleDisable}
                className="flex-1 bg-[#ff6584]/10 hover:bg-[#ff6584]/20 text-[#ff6584] text-sm font-medium py-2.5 rounded-lg border border-[#ff6584]/20 transition-colors"
              >
                Disable Link
              </button>
            </div>
          </div>
        ) : (
          // No link yet
          <button
            onClick={handleGenerate}
            className="w-full bg-[#6c63ff] hover:bg-[#5a52e0] text-white font-medium py-3 rounded-lg transition-colors"
          >
            Generate Public Link
          </button>
        )}
      </div>
    </div>
  );
};

export default ShareModal;