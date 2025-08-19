// @/components/mypage/Header.tsx
"use client";

import { useRef, useEffect, useState } from "react";
import { Settings } from "lucide-react";
import Button from "@/components/common/Button";
import AccountMenuDropdown from "@/components/mypage/AccountMenuDropdown";
import ConfirmPopover from "@/components/common/ConfirmPopover";

interface HeaderProps {
  dateLabel: string;
  userName: string;
  showDropdown: boolean;
  setShowDropdown: (val: boolean) => void;
  onEditAccount: () => void;
  onLogout: () => void; // Container 側の handleLogout
}

export default function Header({
  dateLabel,
  userName,
  showDropdown,
  setShowDropdown,
  onEditAccount,
  onLogout,
}: HeaderProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [showConfirmPopover, setShowConfirmPopover] = useState(false);
  const logoutBtnRef = useRef<HTMLButtonElement | null>(null);

  // 外クリック
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (menuRef.current.contains(e.target as Node)) return;

      if (showConfirmPopover) {
        // Popover 表示中の外クリックは「キャンセル扱い」：
        // Popover を閉じて Dropdown を再オープン
        setShowConfirmPopover(false);
        setShowDropdown(true);
        // 再描画後に Logout ボタンへフォーカス
        setTimeout(() => logoutBtnRef.current?.focus(), 0);
        return;
      }

      if (showDropdown) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showDropdown, showConfirmPopover, setShowDropdown]);

  const handleGearClick = () => {
    if (showConfirmPopover) {
      setShowConfirmPopover(false);
      // ↓ここを関数渡しではなく boolean に
      setShowDropdown(!showDropdown);
      return;
    }
    setShowDropdown(!showDropdown);
  };

  const handleRequestLogoutConfirm = () => {
    // 予定どおり：Popover を前面に出すため、Dropdown は閉じる
    setShowDropdown(false);
    setShowConfirmPopover(true);
  };

  const handleConfirmLogout = async () => {
    setShowConfirmPopover(false);
    setShowDropdown(false);
    onLogout(); // /api/logout → router.push("/")
  };

  const handleCancelLogout = () => {
    // Popover を閉じ、Dropdown を再オープン → Logout ボタンへフォーカス返却
    setShowConfirmPopover(false);
    setShowDropdown(true);
    setTimeout(() => {
      logoutBtnRef.current?.focus();
    }, 0);
  };

  return (
    <div className="mb-2 text-lg font-semibold text-gray-800 flex items-center justify-between">
      <span>{dateLabel}</span>

      <div className="relative" ref={menuRef}>
        <div className="flex items-center space-x-2">
          <span className="text-base">{userName}</span>
          <Button variant="icon" size="sm" onClick={handleGearClick}>
            <Settings className="w-5 h-5" />
          </Button>
        </div>

        {/* Dropdown */}
        {showDropdown && (
          <AccountMenuDropdown
            onEditAccount={onEditAccount}
            onRequestLogoutConfirm={handleRequestLogoutConfirm}
            onClose={() => setShowDropdown(false)}
            onLogoutRef={(el) => (logoutBtnRef.current = el)}
          />
        )}

        {/* ConfirmPopover（Dropdown は閉じている想定） */}
        <ConfirmPopover
          open={showConfirmPopover}
          onClose={handleCancelLogout} // Esc/外クリック/キャンセル
          onConfirm={handleConfirmLogout} // OK
          message="ログアウトしますか？"
          confirmLabel="OK"
          cancelLabel="キャンセル"
          anchorClassName="absolute right-0 mt-2"
          returnFocusEl={logoutBtnRef.current}
        />
      </div>
    </div>
  );
}
