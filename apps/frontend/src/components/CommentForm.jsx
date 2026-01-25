import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const CommentForm = ({ postId, parentId = null, onCommentAdded, placeholder = "Add a comment" }) => {
    const [content, setContent] = useState('');
    const { user } = useAuth();
    const token = localStorage.getItem('token');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        setSubmitting(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/posts/${postId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content, parent_id: parentId })
            });

            if (res.ok) {
                const newComment = await res.json();
                onCommentAdded(newComment);
                setContent('');
            }
        } catch (error) {
            console.error("Failed to post comment", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-2 text-[14px]">
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={placeholder}
                rows={4}
                cols={60}
                className="w-full sm:w-[500px] p-2 text-sm border border-gray-400 font-inter focus:outline-none mb-2 block resize-y"
            />
            <button
                type="submit"
                disabled={submitting}
                className="bg-neutral-200 px-3 py-1 text-xs border border-gray-400 hover:bg-neutral-300 disabled:opacity-50 text-black font-medium"
            >
                {submitting ? 'adding...' : 'add comment'}
            </button>
        </form>
    );
};

export default CommentForm;
