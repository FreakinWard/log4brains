import type { io } from "socket.io-client";

declare global {
  interface Window {
    /**
     * Socket.IO client, loaded by pages/_document.tsx in preview mode only (not part of the static bundle)
     */
    io?: typeof io;
  }
}
