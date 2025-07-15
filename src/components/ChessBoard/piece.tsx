import {
  getPiecePositionStyle,
  getSquareCoordinates,
  getSquareFromCoordinates,
} from "@/lib/utils";
import { Chess, Color, Move, PieceSymbol, Square } from "chess.js";
import Image from "next/image";
import { useEffect, useState } from "react";

export interface PieceProps {
  square: Square;
  type: PieceSymbol;
  color: Color;
  boardSize: number;
  handleMove: (
    from: Square,
    to: Square,
    promotion?: Exclude<PieceSymbol, "p" | "k">
  ) => boolean;
  disableBoard: boolean;
  playerColor: Color;
  inCheck: Color | null;
  chess: Chess;
}

export interface DragState {
  translateX: number;
  translateY: number;
  clientX: number;
  clientY: number;
  scrollX: number;
  scrollY: number;
  dragging: boolean;
  moved: boolean;
}

export interface PieceState {
  legalMoves: Move[];
}

export function Piece({
  square,
  type,
  color,
  boardSize,
  handleMove,
  disableBoard,
  playerColor,
  inCheck,
  chess,
}: PieceProps) {
  const flipped = playerColor === "b";
  const [dragState, setDragState] = useState<DragState>({
    translateX: 0,
    translateY: 0,
    clientX: 0,
    clientY: 0,
    scrollX: 0,
    scrollY: 0,
    dragging: false,
    moved: false,
  });

  const pieceSize = boardSize / 8;
  const { translateX, translateY, dragging, moved } = dragState;

  const [pieceState, setPieceState] = useState<PieceState>({
    legalMoves: [],
  });

  // TODO: for future improvements
  const { legalMoves } = pieceState;

  useEffect(() => {
    if (!moved) return;

    const { x, y } = getSquareCoordinates(square, flipped);
    const toFile = x + Math.round(translateX / pieceSize);
    const toRank = y + Math.round(translateY / pieceSize);
    const toSquare = getSquareFromCoordinates(toFile, toRank, flipped);

    if (toSquare && handleMove(square, toSquare, "q")) {
      setPieceState((prev) => ({
        ...prev,
        legalMoves: [],
      }));
    }

    setDragState((prev) => ({
      ...prev,
      translateX: 0,
      translateY: 0,
      dragging: false,
      moved: false,
    }));
  }, [moved]);

  function addDraggingListeners() {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mouseup", handleMouseUp, { once: true });
    window.addEventListener("blur", handleBlur, { once: true });
  }

  function removeDraggingListeners() {
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("scroll", handleScroll);
  }

  function handleMouseDown(event: React.MouseEvent<HTMLDivElement>) {
    if (disableBoard) return; // Prevent dragging if the board is disabled
    if (playerColor !== color) return; // Prevent dragging if it's not the player's turn
    if (chess.turn() !== playerColor) return;
    if (event.button !== 0) return; // Only handle left mouse button

    const { clientX, clientY, nativeEvent } = event;
    const { offsetX, offsetY } = nativeEvent;
    const { scrollX, scrollY } = window;

    setDragState((prev) => ({
      ...prev,
      translateX: prev.translateX + offsetX - pieceSize / 2,
      translateY: prev.translateY + offsetY - pieceSize / 2,
      clientX,
      clientY,
      scrollX,
      scrollY,
      dragging: true,
    }));

    addDraggingListeners();

    setPieceState((prev) => ({
      ...prev,
      legalMoves: chess.moves({ square, verbose: true }),
    }));
  }

  function handleMouseMove(event: MouseEvent) {
    const { clientX, clientY } = event;

    setDragState((prev) => ({
      ...prev,
      translateX: prev.translateX + clientX - prev.clientX,
      translateY: prev.translateY + clientY - prev.clientY,
      clientX,
      clientY,
    }));
  }

  function handleScroll() {
    const { scrollX, scrollY } = window;

    setDragState((prev) => ({
      ...prev,
      translateX: prev.translateX + scrollX - prev.scrollX,
      translateY: prev.translateY + scrollY - prev.scrollY,
      scrollX,
      scrollY,
    }));
  }

  function handleMouseUp(event: MouseEvent) {
    removeDraggingListeners();
    setDragState((prev) => ({
      ...prev,
      dragging: false,
      moved: true,
    }));
    setPieceState(pieceState);
  }

  function handleBlur() {
    removeDraggingListeners();
    setDragState(dragState);
    setPieceState(pieceState);
  }

  function highlightLegalMoves() {
    return legalMoves.map((move, index) => {
      const { x, y } = getSquareCoordinates(square, flipped);
      const toFile = x + Math.round(translateX / pieceSize);
      const toRank = y + Math.round(translateY / pieceSize);
      const toSquare = getSquareFromCoordinates(toFile, toRank, flipped);

      return (
        <div
          key={index}
          className={`absolute ${getPiecePositionStyle(
            move.to,
            flipped
          )} size-1/8 flex justify-center items-center overflow-hidden`}
        >
          {move.isCapture() ? (
            <div
              className={
                toSquare === move.to
                  ? "bg-black/30 size-full"
                  : "size-full shadow-[0_0_0_100px_#0000004D] rounded-[40%]"
              }
            />
          ) : (
            <div
              className={
                toSquare === move.to
                  ? "bg-black/30 size-full"
                  : "size-1/3 bg-black/30 rounded-full"
              }
            />
          )}
        </div>
      );
    });
  }

  function highlightKingWhenInCheck() {
    return inCheck && inCheck === color && type === "k" ? (
      <div
        className={`absolute ${getPiecePositionStyle(
          square,
          flipped
        )} size-1/8 bg-radial from-red-600 to-transparent `}
      />
    ) : null;
  }

  return (
    <>
      <div
        style={{
          transform: `translate(${translateX}px, ${translateY}px)`,
          zIndex: dragging ? 20 : 10,
          cursor: dragging ? "grabbing" : "grab",
        }}
        className={`absolute ${getPiecePositionStyle(
          square,
          flipped
        )} size-1/8`}
        onMouseDown={handleMouseDown}
      >
        <Image
          src={`/piece/cburnett/${color}${type}.svg`}
          alt={`${color}${type}`}
          draggable={false}
          fill
        />
      </div>
      {highlightKingWhenInCheck()}
      {highlightLegalMoves()}
    </>
  );
}
