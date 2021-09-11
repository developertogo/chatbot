import express from 'express';
import http from 'http';
import path from 'path';
import WebSocket from 'ws';

import startChatBot from './bot';

const app = express();

app.use(express.static(path.join(__dirname, "../../client/build")))

// In local dev mode, we have to run the WS server on a different port than the main HTTP server,
// because the client skeleton bundled with this challenge is built on top of Create React App,
// whose dev server takes ownership of all websocket connections on the port it's running on.
// TODO: Get rid of CRA.

const httpPort = Number(process.env.HTTP_PORT) || 4444;
const wsPort = Number(process.env.WS_PORT) || 5555;
const httpServer = http.createServer(app);
const wss = new WebSocket.Server(httpPort === wsPort ? { server: httpServer} : { port: wsPort });

wss.on('connection', startChatBot);

httpServer.listen(httpPort, () => {
  console.log(`Listening on ports ${httpPort} (http) / ${wsPort} (ws)`)
});
