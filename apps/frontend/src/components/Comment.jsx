import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import CommentForm from './CommentForm';

const Comment = ({ comment, postId, depth = 0, onCommentDeleted }) => {
    const [showReply, setShowReply] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const [currentContent, setCurrentContent] = useState(comment.content);
    const { user } = useAuth();
    const [replies, setReplies] = useState(comment.replies || []);
    const [isDeleted, setIsDeleted] = useState(false);

    const handleReplyAdded = (newReply) => {
        setReplies([newReply, ...replies]);
        setShowReply(false);
    };

    const handleEdit = async () => {
        if (!editContent.trim()) return;

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/posts/${postId}/comments/${comment.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ content: editContent })
            });

            if (res.ok) {
                setCurrentContent(editContent);
                setIsEditing(false);
            } else {
                alert('Failed to edit comment');
            }
        } catch (error) {
            console.error('Failed to edit comment', error);
            alert('Failed to edit comment');
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this comment?')) return;

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/posts/${postId}/comments/${comment.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (res.ok) {
                setIsDeleted(true);
                if (onCommentDeleted) onCommentDeleted(comment.id);
            } else {
                alert('Failed to delete comment');
            }
        } catch (error) {
            console.error('Failed to delete comment', error);
            alert('Failed to delete comment');
        }
    };

    const timeAgo = (dateStr) => {
        const date = new Date(dateStr);
        const seconds = Math.floor((new Date() - date) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    };

    if (isDeleted) {
        return (
            <div className={`mt-2 ${depth > 0 ? 'ml-4 sm:ml-6' : ''}`}>
                <div className="text-[12px] text-gray-400 italic">
                    [deleted]
                </div>
            </div>
        );
    }

    const isAuthor = user && user.username === comment.author;

    return (
        <div className={`mt-2 ${depth > 0 ? 'ml-4 sm:ml-6' : ''}`}>
            <div className="text-[12px] text-gray-500 mb-0.5 leading-none">
                <span className="text-gray-400 hover:text-gray-600 cursor-pointer">▲</span>
                <span className="font-semibold text-gray-700 ml-1 hover:underline cursor-pointer">{comment.author}</span>
                <span className="mx-1">{timeAgo(comment.created_at)}</span>
            </div>

            {isEditing ? (
                <div className="mt-2">
                    <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full p-2 text-sm border border-gray-400 focus:outline-none resize-y"
                        rows={3}
                    />
                    <div className="flex gap-2 mt-2">
                        <button
                            onClick={handleEdit}
                            className="bg-neutral-200 px-3 py-1 text-xs border border-gray-400 hover:bg-neutral-300 text-black font-medium"
                        >
                            save
                        </button>
                        <button
                            onClick={() => {
                                setIsEditing(false);
                                setEditContent(currentContent);
                            }}
                            className="bg-white px-3 py-1 text-xs border border-gray-400 hover:bg-gray-100 text-black font-medium"
                        >
                            cancel
                        </button>
                    </div>
                </div>
            ) : (
                <div className="text-[13px] text-black leading-snug break-words max-w-full overflow-hidden">
                    {currentContent}
                </div>
            )}

            <div className="mt-0.5 flex gap-2">
                {user && (
                    <button
                        onClick={() => setShowReply(!showReply)}
                        className="text-[11px] text-gray-500 hover:underline underline-offset-2"
                    >
                        reply
                    </button>
                )}
                {isAuthor && !isEditing && (
                    <>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="text-[11px] text-gray-500 hover:underline underline-offset-2"
                        >
                            edit
                        </button>
                        <button
                            onClick={handleDelete}
                            className="text-[11px] text-red-500 hover:underline underline-offset-2"
                        >
                            delete
                        </button>
                    </>
                )}
            </div>

            {showReply && (
                <div className="mt-2 mb-4 max-w-lg">
                    <CommentForm
                        postId={postId}
                        parentId={comment.id}
                        onCommentAdded={handleReplyAdded}
                        placeholder=""
                    />
                </div>
            )}

            <div className="mt-1">
                {replies.map(reply => (
                    <Comment
                        key={reply.id}
                        comment={reply}
                        postId={postId}
                        depth={depth + 1}
                        onCommentDeleted={(id) => setReplies(replies.filter(r => r.id !== id))}
                    />
                ))}
            </div>
        </div>
    );
};

export default Comment;
