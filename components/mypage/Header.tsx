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

  // Popover開くまでの遅延を管理する（rAF + setTimeout）
  const openDelayRaf = useRef<number | null>(null);
  const openDelayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearOpenDelays = () => {
    if (openDelayRaf.current != null) {
      cancelAnimationFrame(openDelayRaf.current);
      openDelayRaf.current = null;
    }
    if (openDelayTimer.current != null) {
      clearTimeout(openDelayTimer.current);
      openDelayTimer.current = null;
    }
  };

  useEffect(() => {
    return () => {
      // アンマウント時にディレイを確実に解除
      clearOpenDelays();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 外クリック
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!menuRef.current) return;

      // --- メニュー領域外のクリック ---
      if (!menuRef.current.contains(e.target as Node)) {
        // 開く予定の遅延が残っていたらキャンセル（“パッ”と出るのを防ぐ）
        clearOpenDelays();

        if (showConfirmPopover) {
          // Popover 表示中の外クリックはキャンセル扱い
          setShowConfirmPopover(false);
          setShowDropdown(true);
          setTimeout(() => logoutBtnRef.current?.focus(), 0);
          return;
        }
        if (showDropdown) {
          setShowDropdown(false);
        }
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDropdown, showConfirmPopover]);

  const handleGearClick = () => {
    // Popoverが見えている時にギアを押した場合は Popover を閉じ、Dropdown の開閉をトグル
    if (showConfirmPopover) {
      setShowConfirmPopover(false);
      clearOpenDelays();
      setShowDropdown(!showDropdown);
      return;
    }
    setShowDropdown(!showDropdown);
  };

  // ▼ 重要：Dropdown を閉じてから “少し遅らせて” Popover を開く
  const handleRequestLogoutConfirm = () => {
    // まず Dropdown を閉じる
    setShowDropdown(false);

    // 既存の遅延をクリア（多重起動防止）
    clearOpenDelays();

    // 1フレーム待ってから短い遅延（120ms）で Popover を開く
    openDelayRaf.current = requestAnimationFrame(() => {
      openDelayRaf.current = null;
      openDelayTimer.current = setTimeout(() => {
        setShowConfirmPopover(true);
        openDelayTimer.current = null;
      }, 120);
    });
  };

  const handleConfirmLogout = async () => {
    clearOpenDelays();
    setShowConfirmPopover(false);
    setShowDropdown(false);
    onLogout();
  };

  const handleCancelLogout = () => {
    clearOpenDelays();
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
