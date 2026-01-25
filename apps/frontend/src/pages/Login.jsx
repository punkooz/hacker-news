import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Login failed');

            login(data.token, data.user);
            navigate('/');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="p-4 bg-[var(--color-brand-bg)] min-h-screen font-inter">
            <h2 className="font-bold mb-4 ml-1">Login</h2>
            {error && <div className="mb-4 text-red-600 border border-red-600 bg-red-50 p-2 text-sm inline-block">{error}</div>}

            <form onSubmit={handleSubmit} className="text-sm">
                <div className="flex flex-col gap-2 max-w-[300px]">
                    <div className="flex flex-col">
                        <label className="font-bold text-gray-700 mb-1">username:</label>
                        <input
                            type="text"
                            autoFocus={true}
                            className="border border-gray-400 p-1 w-full"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="font-bold text-gray-700 mb-1">password:</label>
                        <input
                            type="password"
                            className="border border-gray-400 p-1 w-full"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                <div className="mt-4">
                    <button className="bg-neutral-200 border border-gray-400 px-4 py-1.5 text-black hover:bg-neutral-300 font-medium text-xs">
                        login
                    </button>
                </div>

                <div className="mt-6 text-sm">
                    <Link to="/signup">
                        Create an account
                    </Link>
                </div>
            </form>
        </div>
    );
}
