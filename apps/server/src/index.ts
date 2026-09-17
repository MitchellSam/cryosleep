import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { PROTOCOL_VERSION } from '@cryosleep/shared';

const PORT = Number(process.env.PORT ?? 3001);

const http = createServer();
const io = new Server(http, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  socket.emit('hello', { protocolVersion: PROTOCOL_VERSION });
});

http.listen(PORT, () => {
  console.log(`cryosleep server listening on :${PORT}`);
});
