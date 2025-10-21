import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function AdminNews({ user }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [items, setItems] = useState([]);
  const imageRef = useRef();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    axios.get('http://localhost:4000/api/news', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setItems(r.data))
      .catch(() => {});
  }, []);

  async function submit(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    let imageUrl = null;
    const f = imageRef.current.files[0];
    if (f) {
      const form = new FormData();
      form.append('file', f);
      const res = await axios.post('http://localhost:4000/api/upload', form, { headers: { Authorization: `Bearer ${token}` , 'Content-Type': 'multipart/form-data' } });
      imageUrl = res.data.url;
    }
    const res = await axios.post('http://localhost:4000/api/news', { title, body, image: imageUrl }, { headers: { Authorization: `Bearer ${token}` } });
    setItems(prev => [res.data, ...prev]);
    setTitle(''); setBody(''); imageRef.current.value = null;
  }

  if (!user || !user.isAdmin) return <div>Admin only</div>;

  return (
    <div>
      <h3>Post News</h3>
      <form onSubmit={submit}>
        <div><input value={title} onChange={e => setTitle(e.target.value)} placeholder="title" /></div>
        <div><textarea value={body} onChange={e => setBody(e.target.value)} placeholder="body" /></div>
        <div><input type="file" ref={imageRef} /></div>
        <button type="submit">Post</button>
      </form>

      <h4>Existing</h4>
      {items.map(i => (
        <div key={i.id} style={{ borderBottom: '1px solid #eee', padding: 8 }}>
          <strong>{i.title}</strong>
          <div>{i.body}</div>
        </div>
      ))}
    </div>
  );
}
