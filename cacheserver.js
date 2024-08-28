import { WebSocketServer } from 'ws';

let cachedObject = null;

// Create a new WebSocket server
const wss = new WebSocketServer({ port: 8999 });

wss.on('connection', (ws) => {
  console.log('New client connected');

  // Listen for messages from the client
  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);

    if (cachedObject) {
      ws.send(JSON.stringify({ type: 'cache', data: cachedObject }));
    }
    
    // Deserialize the JSON string to an object
    let receivedObject;
    try {
      receivedObject = JSON.parse(message);

      // Cache the received object
      cachedObject = receivedObject;

      console.log('Received object:', receivedObject);
    } catch (error) {
      console.error('Error parsing JSON:', error);
    }

    // Echo the object back to the client as a JSON string
    const responseObject = {
      status: 'success',
      received: receivedObject
    };
    ws.send(JSON.stringify(responseObject));
  });

  // Handle client disconnection
  ws.on('close', () => {
    console.log('Client disconnected');
  });

  // Send a welcome message to the client
  const welcomeMessage = {
    message: 'Welcome to the WebSocket server!',
    timestamp: new Date()
  };
  ws.send(JSON.stringify(welcomeMessage));
});

console.log('WebSocket server is running on ws://localhost:8999');