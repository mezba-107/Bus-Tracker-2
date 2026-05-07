const cors = require("cors");
const express = require("express");
const http = require("http");
const dotenv = require("dotenv");
const { Server } = require("socket.io");

// CONFIG
const connectDB = require("./config/db");

// SOCKET
const initSocket = require("./sockets/busSocket");

// ROUTES
const adminAuthRoutes = require("./routes/adminAuth");
const adminDriverRoutes = require("./routes/adminDriverRoutes");
const driverRoutes = require("./routes/driverRoutes");
const driverProfileRoutes = require("./routes/driverProfileRoutes");
const adminRoutes = require("./routes/adminRoutes");

dotenv.config();

const app = express();
const server = http.createServer(app);

// =====================
// SOCKET.IO
// =====================
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// =====================
// MIDDLEWARE
// =====================
app.use(
  cors({
    origin: ["http://127.0.0.1:5502", "http://localhost:5502"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());

// =====================
// DATABASE
// =====================
connectDB();

// =====================
// SOCKET INIT
// =====================
initSocket(io);

// =====================
// ROUTES
// =====================
const busRoutes = require("./routes/busRoutes")(io);
app.use("/api/bus", busRoutes);

app.use("/api/admin", adminAuthRoutes);
app.use("/api/admin", adminDriverRoutes);
app.use("/api/admin", adminRoutes);

app.use("/api/driver", driverRoutes);
app.use("/api", driverProfileRoutes);

// =====================
// SERVER START
// =====================
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
