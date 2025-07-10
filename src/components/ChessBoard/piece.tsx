import {
  getPiecePositionStyle,
  getSquareCoordinates,
  getSquareFromCoordinates,
} from "@/lib/utils";
import { Chess, Color, Move, PieceSymbol, Square } from "chess.js";
import { transform } from "next/dist/build/swc/generated-native";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

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
  chess,
}: PieceProps) {
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

    const { x, y } = getSquareCoordinates(square);
    const toFile = x + Math.round(translateX / pieceSize);
    const toRank = y + Math.round(translateY / pieceSize);
    console.log(toFile, toRank);
    const toSquare = getSquareFromCoordinates(toFile, toRank);
    console.log("toSquare", toSquare);

    if (handleMove(square, toSquare, "q")) {
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
  }

  function handleBlur() {
    removeDraggingListeners();
    setDragState(dragState);
  }

  return (
    <>
      <div
        style={{
          transform: `translate(${translateX}px, ${translateY}px)`,
        }}
        className={`absolute ${getPiecePositionStyle(square)} ${
          dragging ? "z-10" : ""
        }`}
        onMouseDown={handleMouseDown}
      >
        <Image
          src={`/piece/cburnett/${color}${type}.svg`}
          alt={`${color}${type}`}
          width={boardSize / 8}
          height={boardSize / 8}
          draggable={false}
        />
      </div>
    </>
  );
}
