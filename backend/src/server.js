import 'dotenv/config';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { app } from './app.js';
import { connectDB } from './config/db.js';

const port = process.env.PORT || 5000;
const host = process.env.HOST || 'localhost';
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || '*', credentials: true }
});

app.set('io', io);

io.on('connection', (socket) => {
  socket.on('join:kitchen', () => socket.join('kitchen'));
  socket.on('join:pos', () => socket.join('pos'));
});

connectDB()
  .then(() => {
    server.listen(port, host, () => console.log(`API running at http://${host}:${port}`));
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Stop the other process or set PORT=5001 in backend/.env.`);
    process.exit(1);
  }
  throw error;
});
