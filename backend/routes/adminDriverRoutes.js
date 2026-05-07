const express = require("express");
const User = require("../models/User");
const Notice = require("../models/Notice");

const router = express.Router();

/* ===============================
   ADMIN CREATE DRIVER ACCOUNT
================================ */
router.post("/create-driver", async (req, res) => {
  try {
    const { name, username, password, email } = req.body;

    if (!name || !username || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    // Duplicate check
    const exists = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (exists) {
      return res.status(400).json({
        message: "Driver ID or Email already exists!",
      });
    }

    // Password Hash
    const bcrypt = require("bcryptjs");
    const hashedPass = await bcrypt.hash(password, 10);

    // Create Driver
    const driver = new User({
      name,
      username,
      password: hashedPass,
      email,
      role: "driver",
    });

    await driver.save();

    res.json({
      message: "Driver Created Successfully",
      driver,
    });
  } catch (err) {
    console.log("CREATE DRIVER ERROR:", err);

    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

/* ===============================
   GET ALL DRIVERS
================================ */
router.get("/drivers", async (req, res) => {
  const drivers = await User.find({ role: "driver" });
  res.json(drivers);
});

/* ===============================
   UPDATE DRIVER INFO
================================ */
router.put("/drivers/:id", async (req, res) => {
  try {
    const updatedDriver = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );

    res.status(200).json({
      message: "Driver updated successfully",
      driver: updatedDriver,
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error while updating",
    });
  }
});

/* ===============================
   DELETE DRIVER
================================ */
router.delete("/drivers/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Driver deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error while deleting",
    });
  }
});

/* ===============================
   SEND NOTICE TO DRIVER
================================ */
router.post("/send-notice", async (req, res) => {
  console.log("SCHEMA CHECK:", Notice.schema.obj);
  try {
    const { driverId, message } = req.body;

    console.log("SEND NOTICE HIT:", driverId);

    const driver = await User.findById(driverId);

    if (!driver) {
      return res.status(404).json({
        message: "Driver not found",
      });
    }

    console.log("DRIVER FOUND:", driver.name, driver.username);

    const notice = await Notice.create({
      driverId: driver._id,
      driverName: driver.name,
      driverUsername: driver.username,
      message,
      time: Date.now(),
      seen: false,
    });

    console.log("NOTICE SAVED:", notice);

    res.json({
      message: "Notice sent successfully",
      notice,
    });
  } catch (err) {
    console.log("NOTICE ERROR:", err);
    res.status(500).json({
      message: "Server error",
    });
  }
});

/* ===============================
   GET NOTICES FOR DRIVER
================================ */
router.get("/notices/:driverId", async (req, res) => {
  try {
    const notices = await Notice.find({
      driverId: req.params.driverId,
    }).sort({ time: -1 });

    res.json(notices);
  } catch (err) {
    console.log("GET NOTICE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ===============================
   MARK NOTICE AS SEEN (ALL)
================================ */
router.put("/notices/seen/:driverId", async (req, res) => {
  try {
    const { driverId } = req.params;

    await Notice.updateMany(
      { driverId: driverId, seen: false },
      { $set: { seen: true } },
    );

    res.json({ message: "Marked as seen" });
  } catch (err) {
    console.log("SEEN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ===============================
   MARK SINGLE NOTICE AS SEEN (FIXED)
================================ */
router.put("/notices/seen-single/:id", async (req, res) => {
  try {
    const notice = await Notice.findByIdAndUpdate(
      req.params.id,
      { seen: true },
      { new: true },
    );

    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }

    res.json({ success: true, notice });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
