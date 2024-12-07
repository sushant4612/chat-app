"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const wss = new ws_1.WebSocketServer({ port: 8000 });
let userCnt = 0;
let allSockets = [];
wss.on('connection', (socket) => {
    allSockets.push(socket);
    userCnt++;
    console.log("User connected " + userCnt);
    socket.on("message", (e) => {
        console.log("Message " + e.toString());
        for (let i = 0; i < allSockets.length; i++) {
            const s = allSockets[i];
            s.send(e.toString() + ": sent meesgae");
        }
    });
});
