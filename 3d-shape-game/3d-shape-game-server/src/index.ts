import express from 'express';
import { createServer } from 'http';
import { Server } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { monitor } from '@colyseus/monitor';
import { GameRoom } from './rooms/GameRoom';
import cors from 'cors';

const port = 3000;
const app = express();

app.use(cors());
app.use(express.json());

const server = createServer(app);

const gameServer = new Server({
  transport: new WebSocketTransport({
    server: server,
    pingInterval: 5000,
    pingMaxRetries: 3,
    maxPayload: 1024 * 1024, // 1MB max payload size
  })
});

gameServer.define('game_room', GameRoom);

app.use('/colyseus', monitor());

gameServer.listen(port);
console.log(`[GameServer] Listening on ws://localhost:${port}`);




// chatgpt

// import express from 'express';
// import { createServer } from 'http';
// import { Server } from 'colyseus';
// import { WebSocketTransport } from '@colyseus/ws-transport';
// import { monitor } from '@colyseus/monitor';
// import { GameRoom } from './rooms/GameRoom';
// import cors from 'cors';

// const port = 3000;
// const app = express();

// app.use(cors());
// app.use(express.json());

// const server = createServer(app);

// const gameServer = new Server({
//   transport: new WebSocketTransport({
//     server: server,
//     pingInterval: 5000,
//     pingMaxRetries: 3,
//     maxPayload: 1024 * 1024, // 1MB max payload size
//   })
// });

// gameServer.define('game_room', GameRoom);

// app.use('/colyseus', monitor());

// gameServer.listen(port);
// console.log(`[GameServer] Listening on ws://localhost:${port}`);
