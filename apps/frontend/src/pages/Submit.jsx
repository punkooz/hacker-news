import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Submit() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const [text, setText] = useState('');
    const [error, setError] = useState('');

    if (!user) {
        return <div className="p-4">Please login to submit.</div>;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title) {
            setError("Title is required");
            return;
        }
        if (!url && !text) {
            setError("URL or Text is required");
            return;
        }

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ title, url, text }),
            });
            if (!res.ok) throw new Error('Submission failed');
            navigate('/');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="bg-[var(--color-brand-bg)] min-h-screen p-2 font-inter">
            {error && <div className="mb-4 text-red-600 border border-red-600 bg-red-50 p-2 text-sm inline-block">{error}</div>}

            <form onSubmit={handleSubmit} className="text-[13px] text-gray-700">
                <table className="border-collapse">
                    <tbody>
                        <tr>
                            <td className="pr-4 py-1 font-medium text-right text-black">title</td>
                            <td>
                                <input
                                    className="border border-gray-400 p-1 w-[400px]"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    autoFocus={true}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td className="pr-4 py-1 font-medium text-right text-black">url</td>
                            <td>
                                <input
                                    className="border border-gray-400 p-1 w-[400px]"
                                    value={url}
                                    onChange={e => setUrl(e.target.value)}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td></td>
                            <td className="font-bold text-black py-1">or</td>
                        </tr>
                        <tr>
                            <td className="pr-4 py-1 font-medium text-right align-top text-black">text</td>
                            <td>
                                <textarea
                                    className="border border-gray-400 p-1 w-[400px]"
                                    rows={4}
                                    value={text}
                                    onChange={e => setText(e.target.value)}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td></td>
                            <td className="py-4">
                                <button className="bg-neutral-200 border border-gray-400 px-4 py-1 text-black hover:bg-neutral-300 font-medium text-xs">
                                    submit
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <p className="mt-4 text-xs text-gray-500 max-w-lg leading-relaxed">
                    Leave "url" blank to submit a question for discussion. If there is no url, the text (if any) will appear at the top of the thread.
                </p>
            </form>
        </div>
    );
}
