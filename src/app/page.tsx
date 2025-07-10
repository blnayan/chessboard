import { ChessBoard } from "@/components/ChessBoard";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <ChessBoard />
    </div>
  );
}
