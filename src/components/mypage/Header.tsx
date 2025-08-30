// @/components/mypage/Header.tsx
"use client";

import GearMenu from "@/components/common/GearMenu";

interface HeaderProps {
  dateLabel: string;
  userName: string;
  onEditAccount: () => void;
  onLogout: () => void; // Container 側の handleLogout
}

export default function Header({
  dateLabel,
  userName,
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
      />
    </div>
  );
}
