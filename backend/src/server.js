import 'dotenv/config';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { app } from './app.js';
import { connectDB } from './config/db.js';
import { User } from './models/User.js';

const port = process.env.PORT || 5000;
const isHostedOnRender = Boolean(process.env.RENDER || process.env.RENDER_SERVICE_ID || process.env.RENDER_EXTERNAL_URL);
const host = process.env.NODE_ENV === 'production' || isHostedOnRender ? '0.0.0.0' : process.env.HOST || 'localhost';
const server = createServer(app);
const allowedOrigins = process.env.CLIENT_URL?.split(',').map((o) => o.trim()).filter(Boolean) || [];
const io = new Server(server, {
  cors: {
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || (process.env.NODE_ENV !== 'production' && /^http:\/\/localhost:\d+$/.test(origin))) {
        return callback(null, true);
      }
      return callback(new Error('CORS blocked'));
    },
    credentials: true
  }
});

app.set('io', io);

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error('Unauthorized'));
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('tenant role status');
    if (!user || user.status !== 'active') return next(new Error('Unauthorized'));
    socket.user = user;
    next();
  } catch {
    next(new Error('Unauthorized'));
  }
});

io.on('connection', (socket) => {
  const tenantId = socket.user?.tenant ? String(socket.user.tenant) : null;
  socket.on('join:kitchen', () => {
    if (tenantId) socket.join(`tenant:${tenantId}:kitchen`);
  });
  socket.on('join:pos', () => {
    if (tenantId) socket.join(`tenant:${tenantId}:pos`);
  });
});

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is required');
  process.exit(1);
}

connectDB()
  .then(() => {
    server.listen(port, host, () => console.log(`API running on ${host}:${port}`));
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Stop the other process or set a different PORT.`);
    process.exit(1);
  }
  throw error;
});
