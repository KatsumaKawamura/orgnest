"use client";
import { useRef, useEffect } from "react";
import { Settings } from "lucide-react";
import Button from "@/components/common/Button";
import AccountMenuDropdown from "@/components/mypage/AccountMenuDropdown";

interface HeaderProps {
  dateLabel: string;
  userName: string;
  showDropdown: boolean;
  setShowDropdown: (val: boolean) => void;
  onEditAccount: () => void;
  onLogout: () => void;
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

  // 外クリックで閉じる（シンプル）
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!showDropdown) return;
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showDropdown, setShowDropdown]);

  const handleGearClick = () => {
    setShowDropdown(!showDropdown); // シンプルなトグル
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

        {showDropdown && (
          <AccountMenuDropdown
            onEditAccount={() => {
              setShowDropdown(false);
              onEditAccount();
            }}
            onLogout={() => {
              setShowDropdown(false);
              onLogout();
            }}
            onClose={() => setShowDropdown(false)}
          />
        )}
      </div>
    </div>
  );
}
