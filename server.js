const express = require('express');
const cors = require('cors');
const path = require('path');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const app = express();
const PORT = 3000;

// Setup Arduino Serial Connection
const arduinoPort = new SerialPort({ path: 'COM3', baudRate: 9600 });
const parser = arduinoPort.pipe(new ReadlineParser({ delimiter: '\n' }));

// Store the latest Arduino reading
let latestArduinoData = null;

// Listen for Arduino data
parser.on('data', line => {
    try {
        const jsonData = JSON.parse(line);
        console.log('📡 From Arduino:', jsonData);
        latestArduinoData = jsonData;
    } catch (error) {
        console.error('❌ Invalid JSON from Arduino:', line);
        console.error('Error:', error.message);
    }
});

// Enable CORS for all routes
app.use(cors());

// Serve static files from the current directory
app.use(express.static('./'));

// Status endpoint
app.get('/status', (req, res) => {
    res.json({ 
        status: 'active',
        arduinoConnected: arduinoPort.isOpen
    });
});

// Arduino data endpoint
app.get('/arduino-data', (req, res) => {
    if (latestArduinoData) {
        res.json({
            data: latestArduinoData,
            timestamp: new Date().toISOString()
        });
    } else {
        res.json({
            error: 'No data received from Arduino yet',
            timestamp: new Date().toISOString()
        });
    }
});

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('📡 Listening for Arduino on COM3...');
}); 