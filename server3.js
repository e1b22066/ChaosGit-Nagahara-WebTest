// server.js
import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import cors from 'cors';

const PORT = 8080;

// Create an HTTP server
const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:5501'); // Allow your client domain
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST'); // Allow specific methods
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Allow specific headers

  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Server is running');
});

// Create a WebSocket server using the HTTP server
const wss = new WebSocketServer({ server });
let players = [];

wss.on('connection', (ws) => {
  players.push(ws);
  console.log(`Player connected. Total players: ${players.length}`);

  // Notify all clients about the number of connected players
  broadcast({ type: 'playerCount', count: players.length });

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'startGame' && players.length >= 2) {
        broadcast({ type: 'startGame' });
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  ws.on('close', () => {
    players = players.filter(player => player !== ws);
    console.log(`Player disconnected. Total players: ${players.length}`);
    broadcast({ type: 'playerCount', count: players.length });
  });
});

function broadcast(data) {
  players.forEach((player) => {
    player.send(JSON.stringify(data));
  });
}

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`WebSocket server is also available at ws://localhost:${PORT}`);
});
