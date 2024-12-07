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
        
    })
})