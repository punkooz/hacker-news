import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();

    return (
        <nav className="bg-[var(--color-brand-orange)] px-2 py-1 text-black text-[13px] leading-none mb-4">
            <div className="max-w-4xl mx-auto flex justify-between items-center">
                <div className="flex items-center gap-1.5 flex-wrap">
                    <Link to="/" className="border border-white text-white font-bold px-[5px] py-[2px] mr-1">Y</Link>
                    <Link to="/" className="font-bold mr-2 hover:text-white">Hacker News</Link>
                    <Link to="/?sort=new" className="hover:text-white hover:underline">new</Link>
                    <span className="text-black">|</span>
                    <Link to="/?sort=top" className="hover:text-white hover:underline">top</Link>
                    <span className="text-black">|</span>
                    <Link to="/submit" className="hover:text-white hover:underline">submit</Link>
                </div>
                <div className="text-[13px]">
                    {user ? (
                        <div className="flex gap-2">
                            <span>{user.username}</span>
                            <span>|</span>
                            <button onClick={logout} className="hover:underline">logout</button>
                        </div>
                    ) : (
                        <Link to="/login" className="hover:underline">login</Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
