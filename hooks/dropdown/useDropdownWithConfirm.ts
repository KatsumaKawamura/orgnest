// @/hooks/dropdown/useDropdownWithConfirm.ts
"use client";

import { useEffect, useRef, useState } from "react";

/**
 * ドロップダウンと確認ポップオーバーの挙動を集約。
 * - 外クリックでのクローズ（Confirm中はキャンセル扱いでDropdownに戻す）
 * - Dropdown→Confirm の遅延（rAF + setTimeout, 120ms）
 * - フォーカス返却（Confirmキャンセル時に Logout ボタンへ）
 *
 * 使い方:
 * const {
 *   showDropdown, showConfirmPopover, menuRef, logoutBtnRef,
 *   handleGearClick, handleRequestLogoutConfirm, handleConfirm, handleCancel,
 * } = useDropdownWithConfirm({ onConfirm: yourConfirmHandler });
 */
export default function useDropdownWithConfirm(opts: {
  onConfirm: () => void | Promise<void>;
}) {
  const { onConfirm } = opts;

  const [showDropdown, setShowDropdown] = useState(false);
  const [showConfirmPopover, setShowConfirmPopover] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const logoutBtnRef = useRef<HTMLButtonElement | null>(null);

  // Popover開くまでの遅延（rAF + setTimeout）
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

  useEffect(() => () => clearOpenDelays(), []);

  // 外クリック
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) {
        // 開く予定の遅延が残っていたらキャンセル（“パッ”と出るのを防ぐ）
        clearOpenDelays();

        if (showConfirmPopover) {
          // Popover表示中の外クリックはキャンセル扱い → Dropdownへ戻す
          setShowConfirmPopover(false);
          setShowDropdown(true);
          setTimeout(() => logoutBtnRef.current?.focus(), 0);
          return;
        }
        if (showDropdown) setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showDropdown, showConfirmPopover]);

  // ギア（メニュー）クリック
  const handleGearClick = () => {
    if (showConfirmPopover) {
      setShowConfirmPopover(false);
      clearOpenDelays();
      setShowDropdown((v) => !v);
      return;
    }
    setShowDropdown((v) => !v);
  };

  // Dropdownから「ログアウト確認」を要求
  const handleRequestLogoutConfirm = () => {
    setShowDropdown(false); // まず閉じる
    clearOpenDelays();

    // 1フレーム待ってから短い遅延（120ms）でConfirmを出す
    openDelayRaf.current = requestAnimationFrame(() => {
      openDelayRaf.current = null;
      openDelayTimer.current = setTimeout(() => {
        setShowConfirmPopover(true);
        openDelayTimer.current = null;
      }, 120);
    });
  };

  // Confirm OK
  const handleConfirm = async () => {
    clearOpenDelays();
    setShowConfirmPopover(false);
    setShowDropdown(false);
    await onConfirm();
  };

  // Confirm キャンセル（Esc/外クリック/キャンセルボタン）
  const handleCancel = () => {
    clearOpenDelays();
    setShowConfirmPopover(false);
    setShowDropdown(true);
    setTimeout(() => logoutBtnRef.current?.focus(), 0);
  };

  return {
    // state
    showDropdown,
    showConfirmPopover,
    // refs
    menuRef,
    logoutBtnRef,
    // handlers
    handleGearClick,
    handleRequestLogoutConfirm,
    handleConfirm,
    handleCancel,
    // 必要なら親から直接制御
    setShowDropdown,
  };
}
