// @/components/mypage/AccountMenuDropdown.tsx
"use client";

import { useEffect, useState } from "react";

interface Props {
  onEditAccount: () => void;
  onRequestLogoutConfirm: () => void; // ポップオーバー表示のトリガー
  onClose: () => void; // Dropdown を閉じる
  onLogoutRef?: (el: HTMLButtonElement | null) => void; // フォーカス返却用
}

export default function AccountMenuDropdown({
  onEditAccount,
  onRequestLogoutConfirm,
  onClose,
  onLogoutRef,
}: Props) {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      className={[
        "absolute right-0 mt-2 w-48 z-50 overflow-hidden",
        "rounded-lg border border-gray-200 bg-white shadow-lg",
        "origin-top-right transition-[opacity,transform] duration-200 ease-out",
        entered
          ? "opacity-100 scale-100 translate-y-0"
          : "opacity-0   scale-95  translate-y-2",
      ].join(" ")}
    >
      <button
        className="w-full text-left px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors"
        onClick={() => {
          onClose(); // まず閉じる
          onEditAccount(); // その後に設定モーダルへ
        }}
      >
        アカウント情報の変更
      </button>

      <button
        className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
        ref={onLogoutRef ?? undefined}
        onClick={() => {
          onClose(); // 先に Dropdown を閉じる
          onRequestLogoutConfirm(); // 次に Popover を開く
        }}
      >
        ログアウト
      </button>
    </div>
  );
}
