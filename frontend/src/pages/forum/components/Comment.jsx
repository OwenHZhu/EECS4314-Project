import Icon from "../../../components/generic/Icon.jsx";

export default function Comment({ user, created_at, content, depth = 0, isOwner, onReply }) {
    return (
        <div
            className="mb-6"
            style={{ marginLeft: depth * 32 }}
        >
            {/* User information */}
            <div className="flex flex-row items-center">
                <Icon className="text-[#923F3F] text-4xl">account_circle</Icon>

                <div className="ml-2 mt-1">
                    <h4 className="text-sm text-[#998888]">{user?.username || "Unknown User"}</h4>
                    <p className="text-xs text-[#5A4B4B]">{created_at}</p>
                </div>
            </div>

            {/* Comment content */}
            <p className="text-sm text-[#C6C1B3] ml-12 mt-2">
                {content}
            </p>

            {/* Reply and Edit/Delete row */}
            <div className="ml-12 mt-3 flex items-center justify-between">
                {/* Reply button */}
                <button
                    onClick={onReply}
                    className="flex items-center gap-1 text-xs text-[#7E7272] hover:text-[#C6C1B3] transition"
                >
                    <Icon className="text-sm">mode_comment</Icon>
                    Reply
                </button>

                {/* Edit/Delete buttons (only for owner) */}
                {isOwner && (
                    <div className="flex gap-3 items-center">
                        <Icon className="text-[#3A2A2A] text-sm">edit</Icon>
                        <Icon className="text-[#3A2A2A] text-sm">delete</Icon>
                    </div>
                )}
            </div>
        </div>
    );
}