const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

// Simple in-memory stores for demo
const users = {}; // email -> { passwordHash, name, isAdmin }
const news = [];
const messages = []; // chat history

// Uploads
const uploadsDir = path.join(__dirname, 'uploads');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'))
});
const upload = multer({ storage });
app.use('/uploads', express.static(uploadsDir));

// JWT secret for demo. In production use env var
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

// Register
app.post('/api/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  if (users[email]) return res.status(400).json({ error: 'user exists' });
  const passwordHash = await bcrypt.hash(password, 10);
  users[email] = { passwordHash, name: name || email, isAdmin: false };
  return res.json({ message: 'registered' });
});

// Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const u = users[email];
  if (!u) return res.status(400).json({ error: 'invalid credentials' });
  const ok = await bcrypt.compare(password, u.passwordHash);
  if (!ok) return res.status(400).json({ error: 'invalid credentials' });
  const token = jwt.sign({ email, name: u.name, isAdmin: u.isAdmin }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token });
});

// Middleware to protect routes
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'missing auth' });
  const parts = auth.split(' ');
  if (parts.length !== 2) return res.status(401).json({ error: 'invalid auth' });
  const token = parts[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'invalid token' });
  }
}

// Upload endpoint (for chat files and admin images)
app.post('/api/upload', authMiddleware, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'no file' });
  const url = `/uploads/${path.basename(req.file.path)}`;
  res.json({ url });
});

// Admin: post news
app.post('/api/news', authMiddleware, (req, res) => {
  if (!req.user || !req.user.isAdmin) return res.status(403).json({ error: 'admin only' });
  const { title, body, image } = req.body;
  const item = { id: Date.now().toString(), title, body, image, createdAt: new Date().toISOString() };
  news.unshift(item);
  // broadcast to connected users
  io.emit('news', item);
  res.json(item);
});

app.get('/api/news', authMiddleware, (req, res) => res.json(news));

// Simple endpoint to check token
app.get('/api/me', authMiddleware, (req, res) => res.json(req.user));

// Socket.IO for chat and signaling
io.use((socket, next) => {
  const token = socket.handshake.auth && socket.handshake.auth.token;
  if (!token) return next();
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    socket.user = payload;
  } catch (err) {
    // ignore, allow anonymous sockets too
  }
  next();
});

io.on('connection', (socket) => {
  const user = socket.user || { name: 'Anonymous' };
  console.log('socket connected', user.name || socket.id);

  // send existing messages
  socket.emit('messages', messages.slice(-100));

  socket.on('message', (msg) => {
    const m = { id: Date.now().toString(), from: user.name || 'Anon', text: msg.text, time: new Date().toISOString(), file: msg.file || null };
    messages.push(m);
    io.emit('message', m);
  });

  // signaling for WebRTC
  socket.on('webrtc-offer', (data) => {
    io.to(data.to).emit('webrtc-offer', { from: socket.id, sdp: data.sdp });
  });
  socket.on('webrtc-answer', (data) => {
    io.to(data.to).emit('webrtc-answer', { from: socket.id, sdp: data.sdp });
  });
  socket.on('webrtc-ice', (data) => {
    io.to(data.to).emit('webrtc-ice', { from: socket.id, candidate: data.candidate });
  });

  socket.on('join', (room) => {
    socket.join(room);
  });

  socket.on('disconnect', () => {
    // noop
  });
});

// Create an initial admin user for demo
(async () => {
  const adminEmail = 'admin@example.com';
  const pw = await bcrypt.hash('adminpass', 10);
  users[adminEmail] = { passwordHash: pw, name: 'Admin', isAdmin: true };
})();

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Backend server listening on ${PORT}`));
