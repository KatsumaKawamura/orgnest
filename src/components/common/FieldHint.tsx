"use client";

type Props = {
  message?: string;
  /** neutral:通常 / ok:成功(緑) / waiting:処理中(黄) / error:エラー(赤) */
  state?: "neutral" | "ok" | "waiting" | "error";
  className?: string;
};

export default function FieldHint({
  message,
  state = "neutral",
  className,
}: Props) {
  if (!message) return null;

  const color =
    state === "ok"
      ? "text-green-600"
      : state === "waiting"
      ? "text-amber-600"
      : state === "error"
      ? "text-red-600"
      : "text-gray-800"; // ← neutral は濃いグレー

  return (
    <p
      className={`text-xs mt-1 ${color} ${className ?? ""}`}
      aria-live="polite"
    >
      {message}
    </p>
  );
}
