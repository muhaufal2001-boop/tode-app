import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:4000/api/login', { email, password });
      localStorage.setItem('token', res.data.token);
      const me = await axios.get('http://localhost:4000/api/me', { headers: { Authorization: `Bearer ${res.data.token}` } });
      onLogin(me.data);
      navigate('/chat');
    } catch (err) {
      alert(err.response?.data?.error || 'Login failed');
    }
  }

  return (
    <form onSubmit={submit} style={{ maxWidth: 400 }}>
      <h3>Login</h3>
      <div>
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="email" />
      </div>
      <div>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="password" />
      </div>
      <button type="submit">Login</button>
    </form>
  );
}
