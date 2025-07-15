import { ChessBoard } from "@/components/ChessBoard";
import { JoinRoomData } from "@/lib/socket";
import { redirect } from "next/navigation";

interface GameProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Game({ searchParams }: GameProps) {
  const result = JoinRoomData.safeParse(await searchParams);

  if (!result.success) redirect("/");

  const { roomId, playerId, playerColor } = result.data;

  return (
    <div className="flex justify-center items-center min-h-screen">
      <ChessBoard
        roomId={roomId}
        playerId={playerId}
        playerColor={playerColor}
      />
    </div>
  );
}
