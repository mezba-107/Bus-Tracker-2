const mongoose = require("mongoose");

const busHistorySchema = new mongoose.Schema({
  busNo: { type: String, required: true },

  status: {
    type: String,
    enum: ["online", "offline"],
    required: true,
  },

  lat: Number,
  lng: Number,

  driverId: String,
  driverName: String,
  driverUsername: String,

  time: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("BusHistory", busHistorySchema);
