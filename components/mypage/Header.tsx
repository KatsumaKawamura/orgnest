// @/components/mypage/Header.tsx
"use client";

import GearMenu from "@/components/common/GearMenu";
import type { Dispatch, SetStateAction } from "react";

interface HeaderProps {
  dateLabel: string;
  userName: string;
  showDropdown: boolean; // 既存どおり親から制御
  setShowDropdown: Dispatch<SetStateAction<boolean>>; // 既存どおり親から制御
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
  return (
    <div className="mb-2 text-lg font-semibold text-gray-800 flex items-center justify-between">
      <span>{dateLabel}</span>

      <GearMenu
        displayName={userName}
        onEdit={onEditAccount}
        onConfirmLogout={onLogout}
        showDropdown={showDropdown} // 制御モードでフックに渡す
        setShowDropdown={setShowDropdown}
      />
    </div>
  );
}
