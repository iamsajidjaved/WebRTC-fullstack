import { Socket } from "socket.io";
import { v4 as uuidV4 } from "uuid";

interface IRoomParams {
    roomId: string;
    peerId: string;
}

const rooms: Record<string, string[]> = {};

export const roomHander = (socket: Socket) => {
    const createRoom = () => {
        const roomId = uuidV4();
        rooms[roomId] = [];
        socket.join(roomId);
        socket.emit("room-created", { roomId });

        console.log('The room is created');
    }

    const joinRoom = ({ roomId, peerId }: IRoomParams) => {
        if (rooms[roomId]) {
            rooms[roomId].push(peerId);
            socket.join(roomId);

            socket.to(roomId).emit("user-joined", { peerId });

            socket.emit("get-users", { roomId, participants: rooms[roomId] });

            console.log('user joined the room', roomId, peerId);
        }

        socket.on("disconnect", () => {
            console.log('user left the room', peerId);
            leaveRoom({roomId, peerId});
        })
    }

    const leaveRoom = ({ roomId, peerId }: IRoomParams) => {
        rooms[roomId] = rooms[roomId].filter(id => id !== peerId);
        socket.to(roomId).emit("user-disconnected", peerId);
    }

    socket.on('create-room', createRoom)
    socket.on('join-room', joinRoom)
}