// components/common/FieldHint.tsx
"use client";

interface FieldHintProps {
  message?: string;
  state?: "neutral" | "ok" | "error" | "waiting";
}
export default function FieldHint({
  message,
  state = "neutral",
}: FieldHintProps) {
  const color =
    state === "ok"
      ? "text-green-600"
      : state === "error"
      ? "text-red-600"
      : "text-gray-800"; // waiting / neutral

  return (
    <div className="min-h-[1.25rem] mb-2 text-xs">
      {message ? (
        <p className={color}>{message}</p>
      ) : (
        <span className="invisible">placeholder</span>
      )}
    </div>
  );
}
