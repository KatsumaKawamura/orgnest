// components/common/GearMenu.tsx
"use client";

import { Settings } from "lucide-react";
import Button from "@/components/common/Button";
import AccountMenuDropdown from "@/components/mypage/AccountMenuDropdown";
import ConfirmPopover from "@/components/common/ConfirmPopover";
import useDropdownWithConfirm from "@/hooks/dropdown/useDropdownWithConfirm";
import type { Dispatch, SetStateAction } from "react";

type GearMenuProps = {
  /** 右上に表示する名前（ユーザー名/チーム名など） */
  displayName: string;
  /** 「アカウント情報の変更」（あるいは後にチーム設定） */
  onEdit: () => void;
  /** 確認OK時に実行される処理（ログアウトなど） */
  onConfirmLogout: () => void;

  /** 任意：Header 互換の“制御モード”用。未指定なら非制御で動作 */
  showDropdown?: boolean;
  setShowDropdown?: Dispatch<SetStateAction<boolean>>;
};

export default function GearMenu({
  displayName,
  onEdit,
  onConfirmLogout,
  showDropdown: controlledShowDropdown,
  setShowDropdown: setControlledShowDropdown,
}: GearMenuProps) {
  const {
    showDropdown,
    showConfirmPopover,
    menuRef,
    logoutBtnRef,
    handleGearClick,
    handleRequestLogoutConfirm,
    handleConfirm,
    handleCancel,
    setShowDropdown,
  } = useDropdownWithConfirm({
    onConfirm: onConfirmLogout,
    controlledShowDropdown,
    setControlledShowDropdown,
  });

  return (
    <div className="relative" ref={menuRef}>
      <div className="flex items-center space-x-2">
        <span className="text-base">{displayName}</span>
        <Button variant="icon" size="sm" onClick={handleGearClick}>
          <Settings className="w-5 h-5" />
        </Button>
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <AccountMenuDropdown
          onEditAccount={onEdit}
          onRequestLogoutConfirm={handleRequestLogoutConfirm}
          onClose={() => setShowDropdown(false)}
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
  );
}
