"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { fetchData } from "@/lib/utils";
import { JoinRoomData } from "@/lib/socket";
import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function Home() {
  const router = useRouter();
  const [awaitingServer, setAwaitingServer] = useState(false);

  const handleClick = useCallback(async () => {
    setAwaitingServer(true);
    const { roomId, playerId, playerColor } = await fetchData(
      `${
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000"
      }/newgame`,
      JoinRoomData
    );
    setAwaitingServer(false);
    const params = new URLSearchParams();
    params.set("roomId", roomId);
    params.set("playerId", playerId);
    params.set("playerColor", playerColor);
    router.push(`/game?${params.toString()}`);
  }, []);

  function renderAwaitingServer() {
    return (
      <Dialog open={awaitingServer}>
        <DialogContent showCloseButton={false}>
          <div className="flex justify-center items-center">
            <LoadingSpinner />
          </div>
          <DialogTitle className="text-center text-xl">
            Awaiting Server Response
          </DialogTitle>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      {renderAwaitingServer()}
      <Button onClick={handleClick} className="cursor-pointer">
        New Game
      </Button>
    </div>
  );
}
