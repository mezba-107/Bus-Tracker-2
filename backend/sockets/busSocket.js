const Bus = require("../models/Bus");
const BusHistory = require("../models/BusHistory");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("✅ Client connected:", socket.id);

    // ================= BUS LIVE LOCATION =================
    socket.on("busLocation", async (data) => {
      const { busNo, lat, lng, time, driverId, driverName, driverUsername } =
        data;

      // ✅ Validation
      if (!busNo || lat == null || lng == null) return;

      // socket এর সাথে bus bind করি
      socket.busNo = busNo;

      try {
        await Bus.findOneAndUpdate(
          { busNo: busNo },
          {
            lat,
            lng,
            status: "online",
            driverId,
            driverName,
            driverUsername,
            lastUpdate: time ? new Date(time) : new Date(),
          },
          { new: true, upsert: true },
        );

        await BusHistory.create({
          busNo: busNo,
          status: "online",
          lat,
          lng,
          driverId,
          driverName,
          driverUsername,
          time: time ? new Date(time) : new Date(),
        });

        io.emit("busLocationUpdate", data);
      } catch (err) {
        console.log("❌ DB Error:", err.message);
      }
    });

    // ================= BUS OFFLINE =================
    socket.on("busOffline", async ({ busNo }) => {
      if (!busNo) return;

      try {
        await Bus.findOneAndUpdate(
          { busNo: busNo },
          {
            status: "offline",
            lastUpdate: new Date(),
          },
        );

        await BusHistory.create({
          busNo: busNo,
          status: "offline",
          time: new Date(),
        });

        io.emit("busOfflineUpdate", { busNo });
      } catch (err) {
        console.log("❌ Offline Error:", err.message);
      }
    });

    // ================= DISCONNECT =================
    socket.on("disconnect", async () => {
      console.log("❌ Client disconnected:", socket.id);

      if (!socket.busNo) return;

      try {
        await Bus.findOneAndUpdate(
          { busNo: socket.busNo },
          {
            status: "offline",
            lastUpdate: new Date(),
          },
        );

        await BusHistory.create({
          busNo: socket.busNo,
          status: "offline",
          time: new Date(),
        });
      } catch (err) {
        console.log("❌ Disconnect Error:", err.message);
      }
    });
  });
};
