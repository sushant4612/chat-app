import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({port : 8000})

interface UserSocket extends WebSocket{
    currentRoom?: string;
}

const rooms: Record<string, UserSocket[]> = {};

wss.on('connection', (socket: UserSocket) => {
    console.log("User connected");

    // listening messsage
    socket.on('message', (message: string) => {
        console.log("Mesaage received:", message);

        if(socket.currentRoom && rooms[socket.currentRoom]){
            rooms[socket.currentRoom].forEach((client) => {
                if(client !== socket && client.readyState === 1){
                    client.send(`${message}`);
                }
            })
        }
    })

    //joining room
    socket.on('join', (roomName: string) => {
        console.log(`User joining room: ${roomName}`);
        if(socket.currentRoom && rooms[socket.currentRoom]){
            rooms[socket.currentRoom] = rooms[socket.currentRoom].filter(client => client !== socket);
            console.log(`Removed user from ${socket.currentRoom}`);
        }

        if(!rooms[roomName]){
            rooms[roomName] = [];
        }

        rooms[roomName].push(socket);
        socket.currentRoom = roomName;

        console.log(`${roomName} now has ${rooms[roomName].length} members`);
        socket.send(`Joined ${roomName}`);

        broadcastMessage(socket, `${roomName} now has ${rooms[roomName].length} members`)
    });

    socket.on('leave', (roomName: string) => {
        if(socket.currentRoom && rooms[socket.currentRoom]){
            console.log(`Leaving ${roomName}`);
            rooms[socket.currentRoom] = rooms[socket.currentRoom].filter(client => client !== socket);
        }
        socket.send(`Left the room ${roomName}`)
    })

    socket.on('close', () => {
        console.log('User Disconnected');
        if(socket.currentRoom && rooms[socket.currentRoom]){
            rooms[socket.currentRoom] = rooms[socket.currentRoom].filter(client => client !== socket)
        }
    })
})

const broadcastMessage = (senderSocket: UserSocket, msg: string) => {
    if (senderSocket.currentRoom && rooms[senderSocket.currentRoom]) {
        rooms[senderSocket.currentRoom].forEach((client) => {
            if (client.readyState === 1 && client !== senderSocket) {
                client.send(msg);
            }
        });
    }
};


console.log('Server is running on ws://localhost:8000');