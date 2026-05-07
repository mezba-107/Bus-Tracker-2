const Bus = require("../models/Bus");
const BusHistory = require("../models/BusHistory");

// GET ALL BUSES
exports.getBuses = async (req, res) => {
  try {
    const buses = await Bus.find().sort({ lastUpdate: -1 });
    res.json(buses);
  } catch (err) {
    res.status(500).json({ message: "Failed to load buses" });
  }
};

// GET BUS HISTORY
exports.getBusHistory = async (req, res) => {
  try {
    const { busNo } = req.params;

    const history = await BusHistory.find({ busNo })
      .sort({ time: -1 })
      .limit(50);

    res.json(history);
  } catch (err) {
    res.status(500).json({ message: "Failed to load history" });
  }
};
