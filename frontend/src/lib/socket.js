import { io } from "socket.io-client";

// Folosim origin-ul actual (merge și pe localhost, și pe domeniu)
export const socket = io(window.location.origin, {
  path: "/socket.io/",
  transports: ["websocket"], // forțează WebSocket direct
  reconnection: true,
  upgrade: true
});
