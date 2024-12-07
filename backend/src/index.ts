import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 8000 });

interface UserSocket extends WebSocket {
  currentRoom?: string;
}

const rooms: Record<string, UserSocket[]> = {};

const broadcastMessage = (room: string, sender: UserSocket, message: string) => {
  if (rooms[room]) {
    rooms[room].forEach((client) => {
      if (client.readyState === WebSocket.OPEN && client !== sender) {
        client.send(message);
      }
    });
  }
};

wss.on("connection", (socket: UserSocket) => {
  console.log("A user connected");

  socket.on("message", (rawMessage: string) => {
    let data;
    try {
      data = JSON.parse(rawMessage);
    } catch {
      socket.send("Invalid message format. Please send valid JSON.");
      return;
    }

    const { action, room, text } = data;

    switch (action) {
      case "join":
        if (!room) {
          socket.send("Error: 'room' is required for joining.");
          return;
        }

        if (socket.currentRoom) {
          rooms[socket.currentRoom] = rooms[socket.currentRoom].filter(
            (client) => client !== socket
          );
        }

        if (!rooms[room]) {
          rooms[room] = [];
        }
        rooms[room].push(socket);
        socket.currentRoom = room;

        socket.send(`You joined ${room}`);
        broadcastMessage(room, socket, `A new user joined ${room}.`);
        break;

      case "message":
        if (!socket.currentRoom) {
          socket.send("Error: Join a room before sending messages.");
          return;
        }
        if (!text) {
          socket.send("Error: 'text' is required for messages.");
          return;
        }

        broadcastMessage(socket.currentRoom, socket, `${socket.currentRoom}: ${text}`);
        break;

      default:
        socket.send("Error: Unknown action. Use 'join' or 'message'.");
        break;
    }
  });

  socket.on("close", () => {
    if (socket.currentRoom && rooms[socket.currentRoom]) {
      rooms[socket.currentRoom] = rooms[socket.currentRoom].filter(
        (client) => client !== socket
      );
      broadcastMessage(
        socket.currentRoom,
        socket,
        `A user left ${socket.currentRoom}.`
      );
    }
  });
});

console.log("WebSocket server is running on ws://localhost:8000");