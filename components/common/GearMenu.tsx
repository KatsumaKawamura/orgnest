// @/components/common/GearMenu.tsx
"use client";

import { Settings } from "lucide-react";
import Button from "@/components/common/Button";
import MenuDropdown from "@/components/common/MenuDropdown";
import ConfirmPopover from "@/components/common/ConfirmPopover";
import useDropdownWithConfirm from "@/hooks/dropdown/useDropdownWithConfirm";

type GearMenuLabels = Partial<{
  // Dropdown 側
  edit: string; // 例: "チーム設定"
  logout: string; // 例: "退出"
  // 確認ポップオーバ側
  confirmMessage: string; // 例: "退出しますか？"
  confirmLabel: string; // 例: "OK"
  cancelLabel: string; // 例: "キャンセル"
}>;

type GearMenuProps = {
  /** 右上に表示する名前（ユーザー名/チーム名など） */
  displayName: string;
  /** 「アカウント情報の変更」（あるいは後にチーム設定） */
  onEdit: () => void;
  /** 確認OK時に実行される処理（ログアウトなど） */
  onConfirmLogout: () => void;
  /** 文言差し替え（省略時は無印既定文言） */
  labels?: GearMenuLabels;
};

export default function GearMenu({
  displayName,
  onEdit,
  onConfirmLogout,
  labels,
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
  });

  // 既定文言（無印準拠）
  const defaultConfirm = {
    confirmMessage: "ログアウトしますか？",
    confirmLabel: "OK",
    cancelLabel: "キャンセル",
  };
  const merged = { ...defaultConfirm, ...labels };

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
        <MenuDropdown
          onClose={() => setShowDropdown(false)}
          items={[
            {
              label: labels?.edit ?? "アカウント情報の変更",
              onClick: onEdit,
            },
            {
              label: labels?.logout ?? "ログアウト",
              onClick: handleRequestLogoutConfirm,
              refCallback: (el) => (logoutBtnRef.current = el),
            },
          ]}
        />
      )}

      {/* ConfirmPopover（Dropdown は閉じている想定） */}
      <ConfirmPopover
        open={showConfirmPopover}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        message={merged.confirmMessage}
        confirmLabel={merged.confirmLabel}
        cancelLabel={merged.cancelLabel}
        anchorClassName="absolute right-0 mt-2"
        returnFocusEl={logoutBtnRef.current}
      />
    </div>
  );
}
