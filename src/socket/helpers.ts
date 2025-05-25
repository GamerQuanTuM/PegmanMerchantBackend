import { Server, Socket } from "socket.io";


// Shared state
export const userSocketsMap = new Map<string, Set<string>>();
export const socketToUserMap = new Map<string, string>();
export const socketRoomsMap = new Map<string, Set<string>>();
export let io: Server;

export const setIOInstance = (server: Server) => {
    io = server;
};


// Emit to all users
export const emitToAll = (event: string, data: any) => {
    io.emit(event, data);
};

// Emit to a room
export const emitToRoom = (room: string, event: string, data: any) => {
    io.to(room).emit(event, data);
};

// Emit to socket
export const emitToSocket = (socketId: string, event: string, data: any) => {
    io.to(socketId).emit(event, data);
};

// Broadcast to others
export const broadcastFromSocket = (socket: Socket, event: string, data: any) => {
    socket.broadcast.emit(event, data);
};

// Broadcast to room excluding sender
export const broadcastToRoomExceptSender = (socket: Socket, room: string, event: string, data: any) => {
    socket.to(room).emit(event, data);
};

// Get online users
export const getOnlineUsers = (): string[] => {
    return Array.from(userSocketsMap.keys());
};

// Check if user is online
export const isUserOnline = (userId: string): boolean => {
    return userSocketsMap.has(userId);
};

// Get rooms a socket is in
export const getSocketRooms = (socketId: string): string[] => {
    return Array.from(socketRoomsMap.get(socketId) || []);
};

// Get connected sockets for a user
export const getUserSockets = (userId: string): string[] => {
    return Array.from(userSocketsMap.get(userId) || []);
};

// Join a room
export const joinRoom = (socket: Socket, room: string) => {
    socket.join(room);
    if (!socketRoomsMap.has(socket.id)) {
        socketRoomsMap.set(socket.id, new Set());
    }
    socketRoomsMap.get(socket.id)!.add(room);
    console.log(`🚪 ${socket.id} joined room: ${room}`);
};

// Leave a room
export const leaveRoom = (socket: Socket, room: string) => {
    socket.leave(room);
    socketRoomsMap.get(socket.id)?.delete(room);
    console.log(`🚪 ${socket.id} left room: ${room}`);
};


// Get all connected clients
export const getConnectedClients = () => {
    const result: Record<string, string[]> = {};
    userSocketsMap.forEach((sockets, userId) => {
        result[userId] = Array.from(sockets);
    });
    return result;
};
