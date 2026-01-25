import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';

import Submit from './pages/Submit';

import NewsList from './pages/NewsList';
import PostDetail from './pages/PostDetail';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-neutral-100 font-sans">
          <Navbar />
          <Routes>
            <Route path="/" element={<NewsList />} />
            <Route path="/item/:id" element={<PostDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/submit" element={<Submit />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
