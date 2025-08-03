"use client";

import { ReactNode } from "react";

interface IconButtonProps {
  label: string; // ボタン内のテキスト
  icon?: ReactNode; // アイコン（任意）
  onClick?: () => void; // クリックイベント
  className?: string; // 追加スタイル
}

export default function IconButton({
  label,
  icon,
  onClick,
  className = "",
}: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-2 rounded bg-gray-300 text-gray-800 hover:bg-gray-400 ${className}`}
    >
      {icon && <span className="w-4 h-4">{icon}</span>}
      <span>{label}</span>
    </button>
  );
}
