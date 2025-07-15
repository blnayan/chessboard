"use client";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Chess, Color, PieceSymbol, Square } from "chess.js";
import { Piece } from "@/components/ChessBoard/Piece";
import { socket, JoinRoomData, MoveData } from "@/lib/socket";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { LoadingSpinner } from "../LoadingSpinner";
import Link from "next/link";
import { Button } from "../ui/button";

type Board = ({
  square: Square;
  type: PieceSymbol;
  color: Color;
} | null)[][];

export interface BoardState {
  boardSize: number;
  board: Board;
  roomExists: boolean;
  disableBoard: boolean;
  inCheck: Color | null;
  turn: Color;
  waitingOpponent: boolean;
  gameStatus?: Color | "draw";
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
    roomExists: false,
    disableBoard: true,
    inCheck: null,
    turn: chess.turn(),
    waitingOpponent: false,
  });
  const {
    boardSize,
    board,
    roomExists,
    disableBoard,
    inCheck,
    turn,
    gameStatus,
    waitingOpponent,
  } = boardState;
  const { roomId, playerId, playerColor } = props;

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const handleRoomJoined = (data: unknown) => {
      JoinRoomData.parse(data);
      setBoardState((prev) => ({
        ...prev,
        roomExists: true,
        waitingOpponent: true,
      }));
    };

    const handleBothPlayersReady = () => {
      setBoardState((prev) => ({
        ...prev,
        disableBoard: false,
        waitingOpponent: false,
      }));
    };

    const handleMoveMade = (move: unknown, moveColor: Color) => {
      const parsedMove = MoveData.shape.move.parse(move);
      if (playerColor === moveColor) return;
      chess.move(parsedMove);
      setBoardState((prev) => ({
        ...prev,
        board: chess.board(),
        inCheck: chess.inCheck() ? chess.turn() : null,
        turn: chess.turn(),
      }));
    };

    const handleError = (message: string) => {
      toast.error(message);
      router.push("/");
    };

    const handleDisconnect = () => {
      router.push("/");
    };

    const handleGameOver = ({ gameStatus }: { gameStatus: Color | "draw" }) => {
      socket.off("disconnect", handleDisconnect);
      setBoardState((prev) => ({
        ...prev,
        disableBoard: true,
        gameStatus,
      }));
    };

    socket.on("roomJoined", handleRoomJoined);
    socket.on("bothPlayersReady", handleBothPlayersReady);
    socket.on("moveMade", handleMoveMade);
    socket.on("gameOver", handleGameOver);
    socket.on("disconnect", handleDisconnect);
    socket.on("error", handleError);

    socket.emit("joinRoom", { roomId, playerId, playerColor });

    return () => {
      socket.off("roomJoined", handleRoomJoined);
      socket.off("bothPlayersReady", handleBothPlayersReady);
      socket.off("moveMade", handleMoveMade);
      socket.off("gameOver", handleGameOver);
      socket.off("disconnect", handleDisconnect);
      socket.off("error", handleError);
      socket.disconnect();
    };
  }, [roomId, playerId, playerColor]);

  const handleMove = useCallback(
    (from: Square, to: Square, promotion?: Exclude<PieceSymbol, "p" | "k">) => {
      // will be invalid most likely
      if (chess.turn() !== playerColor) return false;
      try {
        chess.move({ from, to, promotion });
        setBoardState((prev) => ({
          ...prev,
          board: chess.board(),
          inCheck: chess.inCheck() ? chess.turn() : null,
          turn: chess.turn(),
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
    [roomId, playerId]
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
            turn={turn}
            chess={chess}
          />
        );
      })
    );
  }

  function renderChess() {
    return (
      roomExists && (
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
      )
    );
  }

  function renderWaitingForPlayerDialog() {
    return (
      <Dialog open={waitingOpponent}>
        <DialogContent showCloseButton={false}>
          <div className="flex justify-center items-center">
            <LoadingSpinner />
          </div>
          <DialogTitle className="text-center text-3xl">
            Waiting for an Opponent!
          </DialogTitle>
        </DialogContent>
      </Dialog>
    );
  }

  function renderGameOver() {
    return (
      <Dialog open={typeof gameStatus === "string"}>
        <DialogContent showCloseButton={false}>
          <DialogTitle className="text-center text-3xl">
            {gameStatus === "draw"
              ? "Draw"
              : gameStatus === "w"
              ? "White Won"
              : "Black Won"}
          </DialogTitle>
          <Button asChild>
            <Link href="/">Home</Link>
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      {renderChess()}
      {renderWaitingForPlayerDialog()}
      {renderGameOver()}
    </>
  );
}
