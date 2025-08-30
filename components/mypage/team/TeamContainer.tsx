// components/mypage/team/TeamContainer.tsx
"use client";

import { useEffect, useState } from "react";
import TeamLanding from "@/components/mypage/team/TeamLanding";
import TeamLoginModal from "@/components/teamauth/TeamLoginModal";
import TeamRegisterModal from "@/components/teamauth/TeamRegisterModal";
import Button from "@/components/common/Button";
import { Settings } from "lucide-react";
import AccountMenuDropdown from "@/components/mypage/AccountMenuDropdown";
import ConfirmPopover from "@/components/common/ConfirmPopover";
import useDropdownWithConfirm from "@/hooks/dropdown/useDropdownWithConfirm";

type TeamAuthStatus = "loading" | "unauthenticated" | "authenticated";

type TeamInfo = {
  team_id: string;
  team_name: string | null;
  team_login_id?: string | null;
  contact?: string | null;
};

export default function TeamContainer() {
  const [status, setStatus] = useState<TeamAuthStatus>("loading");
  const [team, setTeam] = useState<TeamInfo | null>(null);

  const [showTeamLogin, setShowTeamLogin] = useState(false);
  const [showTeamRegister, setShowTeamRegister] = useState(false);

  // 起動時に /api/team/me で状態復元
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/team/me", {
          method: "GET",
          credentials: "same-origin",
          headers: { "cache-control": "no-store" },
        });
        if (!mounted) return;

        if (res.ok) {
          const data = await res.json().catch(() => null);
          const t = data?.team;
          if (t?.team_id) {
            setTeam({
              team_id: t.team_id,
              team_name: t.team_name ?? null,
              team_login_id: t.team_login_id ?? null,
              contact: t.contact ?? null,
            });
            setStatus("authenticated");
          } else {
            setStatus("unauthenticated");
          }
        } else {
          setStatus("unauthenticated");
        }
      } catch {
        setStatus("unauthenticated");
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // ログアウト
  const handleLogout = async () => {
    try {
      await fetch("/api/team/logout", {
        method: "POST",
        credentials: "same-origin",
        headers: { "cache-control": "no-store" },
      });
    } finally {
      setTeam(null);
      setStatus("unauthenticated");
    }
  };

  // ▼ ドロップダウン／確認ポップオーバー制御（現行挙動をフックに集約・挙動は不変）
  const {
    showDropdown,
    showConfirmPopover,
    menuRef,
    logoutBtnRef,
    handleGearClick,
    handleRequestLogoutConfirm,
    handleConfirm,
    handleCancel,
  } = useDropdownWithConfirm({ onConfirm: handleLogout });

  if (status === "loading") {
    return <div className="p-4" />; // 何も描画しない
  }

  if (status === "unauthenticated") {
    return (
      <div className="p-4">
        {/* 未ログインビュー */}
        <TeamLanding
          onCreateClick={() => setShowTeamRegister(true)}
          onJoinClick={() => setShowTeamLogin(true)}
        />

        {/* Login */}
        {showTeamLogin && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40">
            <TeamLoginModal
              onClose={() => setShowTeamLogin(false)}
              onLoggedIn={(t) => {
                setTeam(t);
                setStatus("authenticated");
                setShowTeamLogin(false);
              }}
            />
          </div>
        )}

        {/* Register */}
        {showTeamRegister && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40">
            <TeamRegisterModal
              onClose={() => setShowTeamRegister(false)}
              onRegistered={(t) => {
                setTeam(t);
                setStatus("authenticated");
                setShowTeamRegister(false);
              }}
            />
          </div>
        )}
      </div>
    );
  }

  // 認証済みビュー
  const displayTeamName = team?.team_name ?? team?.team_login_id ?? "Team";

  return (
    <div className="p-4">
      {/* ヘッダー：左側はタイトル、右側は（ユーザーと同形式の）チーム名＋ギア＋ドロップダウン */}
      <div className="mb-4 flex items-center justify-between text-gray-800">
        <div>
          <h2 className="text-xl font-semibold">Schedule</h2>
        </div>

        {/* ▼ 右側：ユーザーと同形式（名前 + ギア） */}
        <div className="relative" ref={menuRef}>
          <div className="flex items-center space-x-2">
            <span className="text-base">{displayTeamName}</span>
            <Button variant="icon" size="sm" onClick={handleGearClick}>
              <Settings className="w-5 h-5" />
            </Button>
          </div>

          {/* Dropdown */}
          {showDropdown && (
            <AccountMenuDropdown
              onEditAccount={() => {
                // チーム設定モーダル予定地（後続フェーズで差し替え）
                console.log("open team settings (next phase)");
              }}
              onRequestLogoutConfirm={handleRequestLogoutConfirm}
              onClose={() => {
                // 現行の「×=閉じる」相当（確認ポップオーバーではなくDropdownのみを閉じる）
                // フック外から直接閉じる場合は setShowDropdown も公開しているが、ここは onClose を使う
                // → 今回はハンドラに寄せるため、直接 close は不要。安全に false にしたい場合は:
                // setShowDropdown(false);
              }}
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

      {/* ビューバー予定地（空） */}
      <div className="rounded border p-6 text-gray-500">
        （チームビュー：準備中）
      </div>
    </div>
  );
}
