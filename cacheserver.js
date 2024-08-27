import { WebSocketServer } from 'ws';

// Create a new WebSocket server
const wss = new WebSocketServer({ port: 8999 });


wss.on('connection', (ws) => {
  console.log('New client connected');

  // Listen for messages from the client
  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);
    // Echo the message back to the client
    ws.send(`Server received: ${message}`);
  });

  // Handle client disconnection
  ws.on('close', () => {
    console.log('Client disconnected');
  });

  // Send a welcome message to the client
  ws.send('Welcome to the WebSocket server!');
});

console.log('WebSocket server is running on ws://localhost:8999');