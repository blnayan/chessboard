import { ChessBoard } from "@/components/ChessBoard";
import { JoinRoomData } from "@/lib/socket";
import { fetchData } from "@/lib/utils";
import { Color } from "chess.js";
import { redirect } from "next/navigation";

interface GameProps { searchParams: { [key: string]: string | string[] | undefined } }

export default async function Game({searchParams}: GameProps) {
  const joinRoomData = JoinRoomData.safeParse(await searchParams)
  if (!joinRoomData.success) redirect("/")
  const {roomId, playerId, playerColor} = joinRoomData.data;
  const roomOpen = await fetchData(`http://localhost:4000/isRoomOpen?roomId=${roomId}`)
  if (!roomOpen) redirect("/")

  return (
    <div className="flex justify-center items-center min-h-screen">
      <ChessBoard roomId={roomId} playerId={playerId} playerColor={playerColor as Color} />
    </div>
  );
}
