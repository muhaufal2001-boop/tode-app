import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    try {
      await axios.post('http://localhost:4000/api/register', { email, password, name });
      alert('registered, please login');
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.error || 'Register failed');
    }
  }

  return (
    <form onSubmit={submit} style={{ maxWidth: 400 }}>
      <h3>Register</h3>
      <div>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="name" />
      </div>
      <div>
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="email" />
      </div>
      <div>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="password" />
      </div>
      <button type="submit">Register</button>
    </form>
  );
}
