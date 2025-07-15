"use client";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Chess, Color, PieceSymbol, Square } from "chess.js";
import { Piece } from "@/components/ChessBoard/Piece";
import { socket, JoinRoomData, MoveData } from "@/lib/socket";
import { useRouter } from "next/navigation";

type Board = ({
  square: Square;
  type: PieceSymbol;
  color: Color;
} | null)[][];

export interface BoardState {
  boardSize: number;
  board: Board;
  disableBoard: boolean;
  inCheck: Color | null;
}

export interface ChessBoardProps {
  roomId: string;
  playerId: string;
  playerColor: Color;
}

export function ChessBoard(props: ChessBoardProps) {
  const chess = useRef(new Chess()).current;
  const router = useRouter();
  const [boardState, setBoardState] = useState<BoardState>({
    boardSize: 800,
    board: chess.board(),
    disableBoard: true,
    inCheck: null,
  });
  const { boardSize, board, disableBoard, inCheck } = boardState;
  const { roomId, playerId, playerColor } = props;

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const handleRoomJoined = (data: unknown) => {
      JoinRoomData.parse(data);
    };

    const handleBothPlayersReady = () => {
      setBoardState((prev) => ({ ...prev, disableBoard: false }));
    };

    const handleMoveMade = (move: unknown, moveColor: Color) => {
      const parsedMove = MoveData.shape.move.parse(move);
      if (playerColor === moveColor) return;
      chess.move(parsedMove);
      setBoardState((prev) => ({
        ...prev,
        board: chess.board(),
        inCheck: chess.inCheck() ? chess.turn() : null,
      }));
    };

    const handleError = (message: string) => {
      console.error("Socket error:", message);
      router.push("/");
    };

    const handleDisconnect = () => {
      router.push("/");
    };

    socket.on("roomJoined", handleRoomJoined);
    socket.on("bothPlayersReady", handleBothPlayersReady);
    socket.on("moveMade", handleMoveMade);
    socket.on("error", handleError);
    socket.on("disconnect", handleDisconnect);

    socket.emit("joinRoom", { roomId, playerId, playerColor });

    return () => {
      socket.off("roomJoined", handleRoomJoined);
      socket.off("bothPlayersReady", handleBothPlayersReady);
      socket.off("moveMade", handleMoveMade);
      socket.off("disconnect", handleDisconnect);
      socket.off("error", handleError);
      socket.disconnect();
    };
  }, [roomId, playerId, playerColor]);

  const handleMove = useCallback(
    (from: Square, to: Square, promotion?: Exclude<PieceSymbol, "p" | "k">) => {
      try {
        chess.move({ from, to, promotion });
        setBoardState((prev) => ({
          ...prev,
          board: chess.board(),
          inCheck: chess.inCheck() ? chess.turn() : null,
        }));
        socket.emit("move", {
          roomId,
          playerId,
          move: { from, to, promotion },
        });
        return true;
      } catch (error) {
        return false;
      }
    },
    []
  );

  function renderPieces() {
    return board.flatMap((row) =>
      row.map((piece) => {
        if (!piece) return null;
        return (
          <Piece
            key={piece.square}
            square={piece.square}
            type={piece.type}
            color={piece.color}
            boardSize={boardSize}
            handleMove={handleMove}
            disableBoard={disableBoard}
            playerColor={playerColor}
            inCheck={inCheck}
            chess={chess}
          />
        );
      })
    );
  }

  return (
    <div>
      <div className="relative">
        <Image
          className="rounded-md"
          src="/board/brown.svg"
          alt="Chess Board"
          width={boardSize}
          height={boardSize}
          draggable={false}
        />
        {renderPieces()}
      </div>
    </div>
  );
}
