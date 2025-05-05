require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Store data in memory
let powerReadings = [];

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());
app.use(express.static('./'));

// Generate simulated data
function generateSimulatedData() {
    const now = Date.now();
    const phase = (now % 10000) / 10000;
    const power = 1.1; // Fixed power value
    
    const data = {
        voltage: 2.2,
        current: 0.5,
        power: power * 300, // Multiply by 300
        wind_speed: 2.5,
        timestamp: now
    };

    // Store reading
    powerReadings.push(data);
    
    // Keep only last 1000 readings
    if (powerReadings.length > 1000) {
        powerReadings.shift();
    }

    return data;
}

// Current data endpoint
app.get('/arduino-data', (req, res) => {
    const data = generateSimulatedData();
    res.json({
        data: data,
        timestamp: new Date().toISOString()
    });
});

// Historical data endpoint
app.get('/historical-data', (req, res) => {
    const { period } = req.query;
    const now = Date.now();
    let startTime = now - 24 * 60 * 60 * 1000; // Default 24 hours

    if (period === 'week') {
        startTime = now - 7 * 24 * 60 * 60 * 1000;
    } else if (period === 'month') {
        startTime = now - 30 * 24 * 60 * 60 * 1000;
    }

    const filteredData = powerReadings.filter(reading => reading.timestamp >= startTime);
    res.json(filteredData);
});

// Serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`
🚀 Server is running on port ${PORT}
📊 Historical data enabled
    `);
}); 