const mongoose = require('mongoose');

const arduinoDataSchema = new mongoose.Schema({
  value: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  sensorType: {
    type: String,
    default: 'analog'
  }
});

// Get latest readings
arduinoDataSchema.statics.getLatestReadings = function(limit = 10) {
  return this.find().sort({ timestamp: -1 }).limit(limit);
};

// Get readings between two dates
arduinoDataSchema.statics.getReadingsByDateRange = function(startDate, endDate) {
  return this.find({
    timestamp: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ timestamp: 1 });
};

// Get hourly averages for a specific day
arduinoDataSchema.statics.getHourlyAverages = function(date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return this.aggregate([
    {
      $match: {
        timestamp: {
          $gte: startOfDay,
          $lte: endOfDay
        }
      }
    },
    {
      $group: {
        _id: { $hour: "$timestamp" },
        average: { $avg: "$value" },
        max: { $max: "$value" },
        min: { $min: "$value" },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { "_id": 1 }
    }
  ]);
};

// Get statistics for a time period
arduinoDataSchema.statics.getAverageReading = function(timeframe) {
  const query = {};
  if (timeframe) {
    query.timestamp = { $gte: new Date(Date.now() - timeframe) };
  }
  return this.aggregate([
    { $match: query },
    { $group: {
      _id: null,
      average: { $avg: "$value" },
      max: { $max: "$value" },
      min: { $min: "$value" },
      total_readings: { $sum: 1 }
    }}
  ]);
};

module.exports = mongoose.model('ArduinoData', arduinoDataSchema); 