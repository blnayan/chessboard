import { Square } from "chess.js";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import * as z from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const fileStyle: Record<string, string> = {
  a: "left-0",
  b: "left-1/8",
  c: "left-2/8",
  d: "left-3/8",
  e: "left-4/8",
  f: "left-5/8",
  g: "left-6/8",
  h: "left-7/8",
};

const fileFlippedStyle: Record<string, string> = {
  a: "right-0",
  b: "right-1/8",
  c: "right-2/8",
  d: "right-3/8",
  e: "right-4/8",
  f: "right-5/8",
  g: "right-6/8",
  h: "right-7/8",
};

const rankStyle: Record<string, string> = {
  "8": "top-0",
  "7": "top-1/8",
  "6": "top-2/8",
  "5": "top-3/8",
  "4": "top-4/8",
  "3": "top-5/8",
  "2": "top-6/8",
  "1": "top-7/8",
};

const rankFlippedStyle: Record<string, string> = {
  "8": "bottom-0",
  "7": "bottom-1/8",
  "6": "bottom-2/8",
  "5": "bottom-3/8",
  "4": "bottom-4/8",
  "3": "bottom-5/8",
  "2": "bottom-6/8",
  "1": "bottom-7/8",
};

const fileNumber: Record<string, number> = {
  a: 0,
  b: 1,
  c: 2,
  d: 3,
  e: 4,
  f: 5,
  g: 6,
  h: 7,
};

const rankNumber: Record<string, number> = {
  "8": 0,
  "7": 1,
  "6": 2,
  "5": 3,
  "4": 4,
  "3": 5,
  "2": 6,
  "1": 7,
};

const fileNames = ["a", "b", "c", "d", "e", "f", "g", "h"];
const rankNames = ["8", "7", "6", "5", "4", "3", "2", "1"];

export function getSquareCoordinates(square: Square, flipped = false) {
  const x = fileNumber[square.charAt(0)];
  const y = rankNumber[square.charAt(1)];

  if (flipped) return { x: 7 - x, y: 7 - y };
  return { x, y };
}

export function getSquareFromCoordinates(
  x: number,
  y: number,
  flipped = false
): Square | null {
  if (x < 0 || x > 7 || y < 0 || y > 7) {
    return null; // Invalid square
  }

  if (flipped) {
    x = 7 - x; // Flip the x-coordinate
    y = 7 - y; // Flip the y-coordinate
  }

  const file = fileNames[x];
  const rank = rankNames[y];
  return `${file}${rank}` as Square;
}

export function getPiecePositionStyle(square: Square, flipped = false) {
  if (flipped) {
    return `${fileFlippedStyle[square.charAt(0)]} ${
      rankFlippedStyle[square.charAt(1)]
    }`;
  }

  return `${fileStyle[square.charAt(0)]} ${rankStyle[square.charAt(1)]}`;
}

export function getRoundingSide(square: Square, size = "md", flipped = false) {
  if (square === "a8")
    return flipped ? `rounded-br-${size}` : `rounded-tl-${size}`;
  if (square === "a1")
    return flipped ? `rounded-tr-${size}` : `rounded-bl-${size}`;
  if (square === "h8")
    return flipped ? `rounded-bl-${size}` : `rounded-tr-${size}`;
  if (square === "h1")
    return flipped ? `rounded-tl-${size}` : `rounded-br-${size}`;
  return "";
}

export async function fetchData<T>(
  url: string,
  schema: z.ZodType<T>
): Promise<T>;
export async function fetchData(url: string): Promise<unknown>;

export async function fetchData<T>(
  url: string,
  schema?: z.ZodType<T>
): Promise<T | unknown> {
  const response = await fetch(url);
  // Parse the response data
  const data = await response.json(); // Or .text(), .blob(), etc.

  if (schema) {
    return schema.parse(data);
  }

  return data;
}
