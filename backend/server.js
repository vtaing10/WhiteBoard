const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
    cors: { origin: "*" },
});

io.on("connection", (socket) => {
    console.log("New user connected");

    // Handle draw events
    socket.on("draw", (data) => {
        socket.broadcast.emit("draw", data); // Send drawing data to all other users
    });

    // Handle clear events
    socket.on("clear", () => {
        io.emit("clear"); // Clear board for all users
    });

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
