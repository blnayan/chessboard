export interface LoadingSpinnerProps {
  size: number;
}

export function LoadingSpinner() {
  return (
    <div
      className={`size-8 rounded-full border-4 border-t-foreground animate-spin`}
    />
  );
}
