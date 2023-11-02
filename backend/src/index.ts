import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import axios from "axios";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000", "http://127.0.0.1:5173"],
  },
});

io.on("connection", (socket) => {
  console.log(`connect ${socket.id}`);

  socket.on("join-room", async (room: string) => {
    try {
      await socket.join(room);
      updateRoomUserCount(room);
      console.log(`Socket ${socket.id} joined room ${JSON.stringify(room)}`);
    } catch (error) {
      console.error(`Error joining room: ${error}`);
      // Handle error appropriately
    }
  });

  socket.on("leave-room", async (room: string) => {
    try {
      await socket.leave(room);
      updateRoomUserCount(room, true);
      console.log(`Socket ${socket.id} left room ${room}`);
    } catch (error) {
      console.error(`Error leaving room: ${error}`);
      // Handle error appropriately
    }
  });

  socket.on(
    "chart-updated",
    ({
      room,
      nodes,
      edges,
    }: {
      room: string;
      nodes: unknown;
      edges: unknown;
    }) => {
      try {
        console.log("room", room);

        // Broadcast to all other clients in the same room except sender
        socket.to(room).emit("chart-updated", { room, nodes, edges });
        console.log(`chart-updated from ${socket.id} in room ${room}`);
        // console.log(`nodes: ${JSON.stringify(nodes)}`);
      } catch (error) {
        console.error(`Error broadcasting chart update: ${error}`);
        // Handle error appropriately
      }
    },
  );

  function updateRoomUserCount(room: string, isLeaving: boolean = false): void {
    const roomCount: number = io.sockets.adapter.rooms.get(room)?.size || 0;
    console.log("room id", room)
    if (isLeaving) {
      // Emit to the specific user who is leaving
      socket.emit('user-count', roomCount - 1);
    } else {
      // Emit to all in the room
      io.to(room).emit('user-count', roomCount);
    }
  }

  socket.on("disconnect", () => {

    console.log(`disconnect ${socket.id}`);
  });

  // Error handling middleware for Express
  // app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  //   console.error(err.stack);
  //   res.status(500).send("Something broke!");
  // });

  // socket.on("ping", (cb: () => void) => {
  //   console.log("ping");
  //   cb();
  // });

  // socket.on("disconnect", () => {
  //   console.log(`disconnect ${socket.id}`);
  // });

  // socket.on("chart-updated", ({ nodes, edges }) => {
  //   // get sender socket id
  //   const senderSocketId = socket.id;
  //   console.log(`chart-updated from ${senderSocketId}`);

  //   // broadcast to all other clients except sender
  //   socket.broadcast.emit("chart-updated", { nodes, edges });
  // });
});



httpServer.listen(3001);
console.log("server started");
