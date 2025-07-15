"use client";
import { ChessBoard } from "@/components/ChessBoard";
import { Color } from "chess.js";
import { useSearchParams } from "next/navigation";

export default function Game({}) {
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomId");
  const playerId = searchParams.get("playerId");
  const playerColor = searchParams.get("playerColor");

  if (!roomId || !playerId || !playerColor) {
    return <div>Error: Missing game parameters.</div>;
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <ChessBoard roomId={roomId} playerId={playerId} playerColor={playerColor as Color} />
    </div>
  );
}
