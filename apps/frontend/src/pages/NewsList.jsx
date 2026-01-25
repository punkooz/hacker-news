import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NewsList() {
    const [posts, setPosts] = useState([]);
    const [searchParams, setSearchParams] = useSearchParams();
    const page = parseInt(searchParams.get('page')) || 1;
    const sort = searchParams.get('sort') || 'new';
    const query = searchParams.get('q') || '';
    const { user } = useAuth();
    const [searchInput, setSearchInput] = useState(query);

    const fetchPosts = async () => {
        try {
            console.log('Fetching posts from:', `${import.meta.env.VITE_API_URL}/posts?page=${page}&sort=${sort}&q=${query}`);
            const res = await fetch(`${import.meta.env.VITE_API_URL}/posts?page=${page}&sort=${sort}&q=${query}`);
            const data = await res.json();
            setPosts(data.posts || []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [page, sort, query]);

    const handleSearch = (e) => {
        e.preventDefault();
        setSearchParams({ q: searchInput, sort, page: 1 });
    };

    const timeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes";
        return Math.floor(seconds) + " seconds";
    };

    const handleVote = async (postId, value) => {
        if (!user) {
            if (confirm("You need to be logged in to vote. Go to login page?")) {
                navigate('/login');
            }
            return;
        }

        // Optimistic update - instant feedback
        setPosts(posts.map(post =>
            post.id === postId
                ? { ...post, points: post.points + value }
                : post
        ));

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/posts/${postId}/vote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ value })
            });

            if (res.ok) {
                const data = await res.json();
                // Update with actual points from server
                setPosts(posts.map(post =>
                    post.id === postId
                        ? { ...post, points: data.points }
                        : post
                ));
            } else {
                // Revert on error
                setPosts(posts.map(post =>
                    post.id === postId
                        ? { ...post, points: post.points - value }
                        : post
                ));
            }
        } catch (err) {
            console.error(err);
            // Revert on error
            setPosts(posts.map(post =>
                post.id === postId
                    ? { ...post, points: post.points - value }
                    : post
            ));
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen p-2">
            <div className="max-w-4xl mx-auto bg-white shadow-sm p-4 rounded">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <div className="flex gap-4 text-sm font-medium">
                        <Link
                            to={`/?sort=new${query ? `&q=${query}` : ''}`}
                            className={`${sort === 'new' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-500 hover:text-black'}`}
                        >
                            New
                        </Link>
                        <Link
                            to={`/?sort=best${query ? `&q=${query}` : ''}`}
                            className={`${sort === 'best' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-500 hover:text-black'}`}
                        >
                            Best
                        </Link>
                        <Link
                            to={`/?sort=top${query ? `&q=${query}` : ''}`}
                            className={`${sort === 'top' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-500 hover:text-black'}`}
                        >
                            Top
                        </Link>
                    </div>
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Search posts..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="text-xs border border-gray-300 px-2 py-1 rounded focus:outline-none focus:border-orange-500"
                        />
                        <button type="submit" className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300">
                            Search
                        </button>
                    </form>
                </div>
                {posts.map((post, index) => (
                    <div key={post.id} className="flex gap-2 items-start mb-2">
                        <span className="text-gray-500 font-mono w-6 text-right">{(page - 1) * 20 + index + 1}.</span>
                        <div>
                            <div className="flex items-center gap-1">
                                <div className="flex flex-col items-center">
                                    <button onClick={() => handleVote(post.id, 1)} className="text-gray-400 hover:text-orange-500 leading-none">
                                        ▲
                                    </button>
                                    <button onClick={() => handleVote(post.id, -1)} className="text-gray-400 hover:text-purple-500 leading-none">
                                        ▼
                                    </button>
                                </div>
                                {post.url ? (
                                    <a href={post.url} className="font-medium hover:underline text-black visited:text-gray-600 mb-0.5" target="_blank" rel="noreferrer">
                                        {post.title}
                                    </a>
                                ) : (
                                    <Link to={`/item/${post.id}`} className="font-medium hover:underline text-black visited:text-gray-600 mb-0.5">
                                        {post.title}
                                    </Link>
                                )}
                                {post.url && (() => {
                                    try {
                                        return <span className="text-xs text-gray-400">({new URL(post.url).hostname})</span>;
                                    } catch {
                                        return null;
                                    }
                                })()}
                            </div>
                            <div className="text-xs text-gray-500 ml-5">
                                {post.points} points by {post.author} {timeAgo(post.created_at)} ago |
                                <Link to={`/item/${post.id}`} className="hover:underline ml-1">{post.comments_count} comments</Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
