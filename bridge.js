const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const WebSocket = require('ws');

// ✅ Replace 'COM3' with your Arduino port
const port = new SerialPort({ path: 'COM3', baudRate: 9600 });

const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

const wss = new WebSocket.Server({ port: 8080 });
console.log("✅ WebSocket server running at ws://localhost:8080");

wss.on('connection', ws => {
  console.log('🔌 WebSocket client connected');
});

parser.on('data', line => {
  try {
    // Try to parse the incoming data as JSON
    const jsonData = JSON.parse(line);
    console.log('📡 From Arduino (valid JSON):', jsonData);
    
    // Only forward valid JSON to clients
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(jsonData));
      }
    });
  } catch (error) {
    console.error('❌ Invalid JSON from Arduino:', line);
    console.error('Error:', error.message);
  }
});
