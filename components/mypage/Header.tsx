// @/components/mypage/Header.tsx
"use client";

import Button from "@/components/common/Button";
import AccountMenuDropdown from "@/components/mypage/AccountMenuDropdown";
import ConfirmPopover from "@/components/common/ConfirmPopover";
import useDropdownWithConfirm from "@/hooks/dropdown/useDropdownWithConfirm";
import { Settings } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

interface HeaderProps {
  dateLabel: string;
  userName: string;
  showDropdown: boolean; // 親から制御
  setShowDropdown: Dispatch<SetStateAction<boolean>>; // ← 型を広げる（関数更新対応）
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
  const {
    showConfirmPopover,
    menuRef,
    logoutBtnRef,
    handleGearClick,
    handleRequestLogoutConfirm,
    handleConfirm,
    handleCancel,
    setShowDropdown: setShowDropdownFromHook,
  } = useDropdownWithConfirm({
    onConfirm: onLogout,
    controlledShowDropdown: showDropdown,
    setControlledShowDropdown: setShowDropdown,
  });

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
            onClose={() => setShowDropdownFromHook(false)} // 明示的に閉じる
            onLogoutRef={(el) => (logoutBtnRef.current = el)}
          />
        )}

        {/* ConfirmPopover（Dropdown は閉じている想定） */}
        <ConfirmPopover
          open={showConfirmPopover}
          onClose={handleCancel} // Esc/外クリック/キャンセル
          onConfirm={handleConfirm} // OK
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
