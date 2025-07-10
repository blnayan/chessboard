"use client";
import Image from "next/image";
import { useCallback, useState } from "react";
import { Chess, Color, PieceSymbol, Square } from "chess.js";
import { Piece } from "./piece";

type Board = ({
  square: Square;
  type: PieceSymbol;
  color: Color;
} | null)[][];

export interface BoardState {
  boardSize: number;
  board: Board;
}

const chess = new Chess();

export function ChessBoard() {
  const [boardState, setBoardState] = useState<BoardState>({
    boardSize: 800,
    board: chess.board(),
  });
  const { boardSize, board } = boardState;

  const handleMove = useCallback(
    (from: Square, to: Square, promotion?: Exclude<PieceSymbol, "p" | "k">) => {
      try {
        chess.move({ from, to, promotion });
        setBoardState((prevState) => ({
          ...prevState,
          board: chess.board(),
        }));
        return true;
      } catch (error) {
        console.error("Invalid move:", error);
        return false;
      }
    },
    [chess]
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
