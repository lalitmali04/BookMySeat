import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin;
    socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
  }
  return socket;
}

export function joinShowRoom(showId: string) {
  const s = getSocket();
  s.emit('join_show', showId);
}

export function leaveShowRoom(showId: string) {
  const s = getSocket();
  s.emit('leave_show', showId);
}
