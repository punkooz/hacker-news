import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Comment from '../components/Comment';
import CommentForm from '../components/CommentForm';

const PostDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPostAndComments = async () => {
            try {
                const [postRes, commentsRes] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_URL}/posts/${id}`),
                    fetch(`${import.meta.env.VITE_API_URL}/posts/${id}/comments`)
                ]);
                const postData = await postRes.json();
                const commentsData = await commentsRes.json();
                setPost(postData);
                setComments(commentsData);
            } catch (error) {
                console.error("Failed to fetch", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPostAndComments();
    }, [id]);

    const handleCommentAdded = (newComment) => {
        setComments([newComment, ...comments]);
    };

    if (loading) return <div className="p-8 text-center text-neutral-500">Loading...</div>;
    if (!post) return <div className="p-8 text-center text-red-500">Post not found.</div>;

    return (
        <div className="bg-[var(--color-brand-bg)] min-h-screen pb-4">
            <div className="bg-[var(--color-brand-bg)] max-w-4xl mx-auto p-2">
                <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                        <h1 className="text-[15px] font-medium text-black mb-1">
                            <span className="text-gray-500 mr-2">▲</span>
                            {post.url ? (
                                <>
                                    <a href={post.url} target="_blank" rel="noopener noreferrer" className="hover:underline visited:text-gray-600">
                                        {post.title}
                                    </a>
                                    <span className="text-xs text-gray-500 ml-1 font-normal">({new URL(post.url).hostname})</span>
                                </>
                            ) : (
                                <span>{post.title}</span>
                            )}
                        </h1>
                    </div>
                    <div className="text-[10px] text-gray-500 ml-4 pl-1">
                        {post.points} points by <Link to={`/user/${post.author}`} className="hover:underline">{post.author}</Link> | {post.comments_count} comments
                    </div>

                    {post.text && (
                        <div className="mt-4 ml-5 text-[14px] text-black leading-relaxed whitespace-pre-wrap max-w-3xl overflow-hidden font-inter">
                            {post.text}
                        </div>
                    )}
                </div>

                <div className="ml-0 mt-6">
                    {user ? (
                        <div className="mb-8 ml-0 max-w-lg">
                            <CommentForm postId={id} onCommentAdded={handleCommentAdded} />
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 mb-6 font-medium">
                            <Link to="/login" className="underline">login</Link> to comment
                        </p>
                    )}

                    <div className="space-y-3">
                        {comments.length > 0 ? (
                            comments.map(comment => (
                                <Comment key={comment.id} comment={comment} postId={id} />
                            ))
                        ) : (
                            <p className="text-sm text-neutral-400">No comments yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostDetail;
