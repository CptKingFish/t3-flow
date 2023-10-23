import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000", "http://127.0.0.1:5173"],
  },
});

io.on("connection", (socket) => {
  console.log(`connect ${socket.id}`);

  socket.on("ping", (cb) => {
    console.log("ping");
    cb();
  });

  socket.on("disconnect", () => {
    console.log(`disconnect ${socket.id}`);
  });

  socket.on("chart-updated", ({ nodes, edges }) => {
    // get sender socket id
    const senderSocketId = socket.id;
    console.log(`chart-updated from ${senderSocketId}`);

    console.log(`nodes`);
    console.dir(nodes);
    console.log(`edges`);
    console.dir(edges);

    // broadcast to all other clients except sender
    socket.broadcast.emit("chart-updated", { nodes, edges });
  });
});

httpServer.listen(3001);
console.log("server started");
