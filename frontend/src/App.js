import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Chat from './Chat';
import Login from './Login';
import Register from './Register';
import AdminNews from './AdminNews';
import './App.css';

function Nav({ user, onLogout }) {
  return (
    <nav className="nav">
      <Link to="/">Home</Link>
      {user ? <Link to="/chat">Chat</Link> : null}
      {user && user.isAdmin ? <Link to="/admin">Admin</Link> : null}
      {user ? (
        <button onClick={onLogout}>Logout</button>
      ) : (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>
      )}
    </nav>
  );
}

function Home({ user }) {
  return (
    <div>
      <h2>Welcome {user ? user.name : 'guest'}</h2>
      <p>Use chat to talk, or admin to post news (admin only).</p>
    </div>
  );
}

function AppWrapper() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get('http://localhost:4000/api/me', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => setUser(r.data))
        .catch(() => localStorage.removeItem('token'));
    }
  }, []);

  function onLogout() {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  }

  return (
    <div>
      <Nav user={user} onLogout={onLogout} />
      <Routes>
        <Route path="/" element={<Home user={user} />} />
        <Route path="/login" element={<Login onLogin={u => setUser(u)} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/chat" element={<Chat user={user} />} />
        <Route path="/admin" element={<AdminNews user={user} />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppWrapper />
    </BrowserRouter>
  );
}
