"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { fetchData } from "@/lib/utils";
import { JoinRoomData } from "@/lib/socket";

export default function Home() {
  const router = useRouter();

  const handleClick = async () => {
    const { roomId, playerId, playerColor } = await fetchData(
      `${
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000"
      }/newgame`,
      JoinRoomData
    );

    const params = new URLSearchParams();
    params.set("roomId", roomId);
    params.set("playerId", playerId);
    params.set("playerColor", playerColor);
    router.push(`/game?${params.toString()}`);
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Button onClick={handleClick} className="cursor-pointer">
        New Game
      </Button>
    </div>
  );
}
