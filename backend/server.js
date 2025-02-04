const app = require("./app");
const connectDatabase = require("./db/Database");
const cloudinary = require("cloudinary");
const http = require("http"); // Import HTTP module
const { Server } = require("socket.io"); // Import Socket.IO

// Handling uncaught Exception
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down the server due to uncaught exception`);
});

// Load environment variables
if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({
    path: "config/.env",
  });
}

// Connect to database
connectDatabase();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket Server
const io = new Server(server, {
  cors: {
    origin: "https://mern-e-shop-123.vercel.app", // Your frontend URL
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ["websocket", "polling"]
});

// Handle WebSocket connections
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });

  // Example: Listen for a message event from frontend
  socket.on("sendMessage", (data) => {
    console.log("Received message:", data);
    io.emit("receiveMessage", data); // Broadcast message to all connected clients
  });
});

// Start the server
server.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.log(`Shutting down the server due to: ${err.message}`);

  server.close(() => {
    process.exit(1);
  });
});
