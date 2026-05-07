const express = require("express");
const router = express.Router();

const { getBuses, getBusHistory } = require("../controllers/adminController");

// শুধু route থাকবে
router.get("/buses", getBuses);
router.get("/bus/:busNo/history", getBusHistory);

module.exports = router;
