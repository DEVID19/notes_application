// TypingIndicator — shows "Alice is typing..." when a collaborator is typing
// State used: state.notes.typingUsers (set by socket events)

import { useSelector } from "react-redux";

const TypingIndicator = () => {
  const { typingUsers } = useSelector((state) => state.notes);
  const { user } = useSelector((state) => state.auth);

  // Filter out yourself — you don't need to see your own typing indicator
  const others = typingUsers.filter((u) => u.userId !== user?._id);

  if (others.length === 0) return null;

  const names = others.map((u) => u.userName).join(", ");
  const label = others.length === 1 ? `${names} is typing` : `${names} are typing`;

  return (
    <div className="flex items-center gap-2 text-[#888899] text-xs font-mono px-1">
      {/* Animated dots */}
      <div className="flex gap-0.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-[#6c63ff] animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
      <span>{label}...</span>
    </div>
  );
};

export default TypingIndicator;