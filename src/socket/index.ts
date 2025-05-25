// socket/index.ts
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import app from "../app";
import {
    userSocketsMap,
    socketToUserMap,
    socketRoomsMap,
    emitToAll,
    joinRoom,
    leaveRoom,
    setIOInstance
} from "./helpers";

// @ts-ignore
const httpServer = createServer(app.fetch);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    },
});

setIOInstance(io);

io.on("connection", (socket: Socket) => {
    console.log(`🔌 Connected: ${socket.id}`);

    socket.on("register", (userId: string) => {
        if (!userSocketsMap.has(userId)) {
            userSocketsMap.set(userId, new Set());
        }
        userSocketsMap.get(userId)!.add(socket.id);
        socketToUserMap.set(socket.id, userId);

        console.log(`✅ Registered: ${userId} -> ${socket.id}`);
        emitToAll("user:online", { userId });
    });

    socket.on("join", (room: string) => {
        joinRoom(socket, room);
    });

    socket.on("leave", (room: string) => {
        leaveRoom(socket, room);
    });

    socket.on("disconnect", () => {
        const userId = socketToUserMap.get(socket.id);
        if (userId) {
            const sockets = userSocketsMap.get(userId);
            sockets?.delete(socket.id);
            if (!sockets || sockets.size === 0) {
                userSocketsMap.delete(userId);
                emitToAll("user:offline", { userId });
            }
            socketToUserMap.delete(socket.id);
        }
        socketRoomsMap.delete(socket.id);
        console.log(`❌ Disconnected: ${socket.id}`);
    });
});

export default httpServer;
