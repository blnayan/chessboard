"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import * as z from "zod";
import { useRouter } from "next/navigation";

const JoinRoomData = z.object({
  roomId: z.string(),
  playerId: z.string(),
  color: z.enum(["w", "b"]),
});

async function fetchData<T>(url: string, schema: z.ZodType<T>): Promise<T>;
async function fetchData(url: string): Promise<any>;

async function fetchData<T>(
  url: string,
  schema?: z.ZodType<T>
): Promise<T | any> {
  const response = await fetch(url);
  // Parse the response data
  let data = await response.json(); // Or .text(), .blob(), etc.

  if (schema) {
    return schema.parse(data);
  }

  return data;
}

export default function Home() {
  const router = useRouter();

  const handleClick = async () => {
    const { roomId, playerId, color } = await fetchData(
      "http://localhost:4000/newgame",
      JoinRoomData
    );
    const params = new URLSearchParams();
    params.set("roomId", roomId);
    params.set("playerId", playerId);
    params.set("color", color);
    router.push(`/game?${params.toString()}`);
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Button onClick={handleClick}>New Game</Button>
    </div>
  );
}
