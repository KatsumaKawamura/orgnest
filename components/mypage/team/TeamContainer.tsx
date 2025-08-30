// components/mypage/team/TeamContainer.tsx
"use client";

import { useEffect, useState } from "react";
import TeamLanding from "@/components/mypage/team/TeamLanding";
import TeamLoginModal from "@/components/teamauth/TeamLoginModal";
import TeamRegisterModal from "@/components/teamauth/TeamRegisterModal";
import GearMenu from "@/components/common/GearMenu";
import TeamSettingsModal from "@/components/teamaccount/TeamSettingsModal"; // ← 追加

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
  const [showTeamSettings, setShowTeamSettings] = useState(false); // ← 追加

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
          <div className="fixed inset-0 z-[1000] flex items-center justify中心 bg-black/40">
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

        {/* 右側：共通 GearMenu（非制御モード） */}
        <GearMenu
          displayName={displayTeamName}
          onEdit={() => {
            setShowTeamSettings(true); // ← ここで TeamSettingsModal を開く
          }}
          onConfirmLogout={handleLogout}
        />
      </div>

      {/* ビューバー予定地（空） */}
      <div className="rounded border p-6 text-gray-500">
        （チームビュー：準備中）
      </div>

      {/* Team 設定モーダル */}
      {showTeamSettings && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40">
          <TeamSettingsModal
            onClose={() => setShowTeamSettings(false)}
            initial={
              team
                ? {
                    team_login_id: team.team_login_id ?? "",
                    team_name: team.team_name ?? null,
                    contact: team.contact ?? null,
                  }
                : undefined
            }
            onUpdated={(updated) => {
              setTeam((prev) =>
                prev ? { ...prev, ...updated } : { team_id: "", ...updated }
              );
            }}
          />
        </div>
      )}
    </div>
  );
}
