import Comment from "./Comment.jsx";
import { useAuth } from "../../../hooks/auth/useAuth.js";
import { format } from "date-fns";

export default function Reply({
    reply,
    depth = 0,
    onReply,
    activeParentId,
    handleChildSubmit,
    childReply,
    setChildReply
}) {
    const { user } = useAuth();

    return (
        <div>
            <Comment
                user={reply.user}
                content={reply.content}
                created_at={format(reply.created_at, "MMMM dd, yyyy")}
                depth={depth}
                isOwner={user.id === reply.user_id}
                onReply={() => onReply(reply.id)}
            />

            {/* Inline reply input under the selected comment */}
            {activeParentId === reply.id && (
                <form onSubmit={handleChildSubmit} className="ml-12 mt-3 relative">
                    <input
                        type="text"
                        value={childReply}
                        onChange={(e) => setChildReply(e.target.value)}
                        placeholder="Write a reply..."
                        className="bg-transparent border py-2 px-3 w-full text-sm text-[#C6C1B3]"
                    />

                    {childReply.trim().length > 0 && (
                        <button
                            type="submit"
                            className="absolute right-2 top-1/2 -translate-y-1/2 
                                bg-[#1E3C36] text-[#C6C1B3] text-xs 
                                px-3 py-1 rounded-full border border-[#2A4A45]
                                hover:bg-[#2A4A45] transition"
                        >
                            Reply
                        </button>
                    )}
                </form>
            )}

            {/* Render children recursively */}
            {reply.children && reply.children.length > 0 && (
                reply.children.map(child => (
                    <Reply
                        key={child.id}
                        reply={child}
                        depth={depth + 1}
                        onReply={onReply}
                        activeParentId={activeParentId}
                        handleChildSubmit={handleChildSubmit}
                        childReply={childReply}
                        setChildReply={setChildReply}
                    />
                ))
            )}
        </div>
    );
}
