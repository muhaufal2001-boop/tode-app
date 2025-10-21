import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';

export default function Chat({ user }) {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [news, setNews] = useState([]);
  const fileRef = useRef();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const s = io('http://localhost:4000', { auth: { token } });
    setSocket(s);
    s.on('messages', (m) => setMessages(m));
    s.on('message', (m) => setMessages(prev => [...prev, m]));
    s.on('news', (n) => setNews(prev => [n, ...prev]));
    return () => s.disconnect();
  }, []);

  async function send() {
    if (!socket) return;
    socket.emit('message', { text });
    setText('');
  }

  async function uploadAndSend(e) {
    const f = fileRef.current.files[0];
    if (!f) return alert('pick a file');
    const form = new FormData();
    form.append('file', f);
    const token = localStorage.getItem('token');
    const res = await axios.post('http://localhost:4000/api/upload', form, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } });
    socket.emit('message', { text: '', file: res.data.url });
    fileRef.current.value = null;
  }

  return (
    <div>
      <h3>Chat</h3>
      <div style={{ display: 'flex', gap: 20 }}>
        <div style={{ flex: 1 }}>
          <div style={{ height: 300, overflow: 'auto', border: '1px solid #ccc', padding: 10 }}>
            {messages.map(m => (
              <div key={m.id} style={{ marginBottom: 8 }}>
                <strong>{m.from}</strong>: {m.text}
                {m.file ? (<div><a target="_blank" rel="noreferrer" href={`http://localhost:4000${m.file}`}>file</a></div>) : null}
              </div>
            ))}
          </div>
          <div>
            <input value={text} onChange={e => setText(e.target.value)} placeholder="message" />
            <button onClick={send}>Send</button>
          </div>
          <div>
            <input type="file" ref={fileRef} />
            <button onClick={uploadAndSend}>Upload & Send</button>
          </div>
        </div>
        <div style={{ width: 320 }}>
          <h4>News</h4>
          {news.map(n => (
            <div key={n.id} style={{ borderBottom: '1px solid #eee', padding: 8 }}>
              <strong>{n.title}</strong>
              <div>{n.body}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
