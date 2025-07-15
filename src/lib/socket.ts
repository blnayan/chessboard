import { Color } from "chess.js";
import { io, Socket } from "socket.io-client";
import * as z from "zod";

const URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";

export const JoinRoomData = z.object({
  roomId: z.string(),
  playerId: z.string(),
  playerColor: z.enum(["w", "b"]),
});

export type JoinRoomDataType = z.infer<typeof JoinRoomData>;

export const MoveData = z.object({
  roomId: z.string(),
  playerId: z.string(),
  move: z.object({
    from: z.string(),
    to: z.string(),
    promotion: z.string().optional(),
  }),
});

export type MoveDataType = z.infer<typeof MoveData>;

interface ServerToClientEvents {
  error: (message: string) => void;
  roomJoined: (data: JoinRoomDataType) => void;
  bothPlayersReady: () => void;
  moveMade: (move: MoveDataType["move"], moveColor: Color) => void;
  gameOver: (data: { gameStatus: Color | "draw" }) => void;
}

interface ClientToServerEvents {
  joinRoom: (data: JoinRoomDataType) => void;
  move: (data: MoveDataType) => void;
}

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  URL,
  {
    autoConnect: false, // you’ll connect manually (best for games)
    withCredentials: true,
  }
);
