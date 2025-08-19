// @/components/mypage/AccountMenuDropdown.tsx
"use client";

import { useEffect, useState } from "react";

interface Props {
  onEditAccount: () => void;
  onLogout: () => void;
  onClose: () => void;
}

export default function AccountMenuDropdown({
  onEditAccount,
  onLogout,
  onClose,
}: Props) {
  const [entered, setEntered] = useState(false);

  // マウント後に自然な入場アニメ（開くときだけ）
  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      className={[
        "absolute right-0 mt-2 w-48 z-50 overflow-hidden",
        "rounded-lg border border-gray-200 bg-white shadow-lg",
        // 自然な動き：opacity + scale + 少しだけ下にスライド
        "origin-top-right transition-[opacity,transform] duration-200 ease-out",
        entered
          ? "opacity-100 scale-100 translate-y-0"
          : "opacity-0   scale-95  translate-y-2",
      ].join(" ")}
    >
      <button
        className="w-full text-left px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors"
        onClick={() => {
          onClose(); // 即時クローズ（安定優先）
          onEditAccount();
        }}
      >
        アカウント情報の変更
      </button>
      <button
        className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
        onClick={() => {
          onClose(); // 即時クローズ
          onLogout();
        }}
      >
        ログアウト
      </button>
    </div>
  );
}
