// components/mypage/team/TeamContainer.tsx
"use client";

import { useEffect, useState } from "react";
import TeamLanding from "@/components/mypage/team/TeamLanding";
import TeamLoginModal from "@/components/teamauth/TeamLoginModal";
import TeamRegisterModal from "@/components/teamauth/TeamRegisterModal";
import Button from "@/components/common/Button";

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

  if (status === "loading") {
    return (
      <div className="p-4">
        <div className="animate-pulse h-6 w-40 bg-gray-300 rounded mb-4" />
        <div className="animate-pulse h-32 w-full bg-gray-200 rounded" />
      </div>
    );
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

  // 認証済みビュー：メニューのみ先に実装。ビュー本体は予定地（空）
  return (
    <div className="p-4">
      {/* メニュー（ヘッダ） */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            {team?.team_name ?? team?.team_id ?? "Team"}
          </h2>
          <p className="text-xs text-gray-500">
            {team?.team_login_id ? `@${team.team_login_id}` : ""}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              // 設定モーダル予定地（次フェーズで接続）
              console.log("open team settings (next phase)");
            }}
          >
            設定
          </Button>
          <Button variant="danger" onClick={handleLogout}>
            ログアウト
          </Button>
        </div>
      </div>

      {/* ビューバー予定地（空） */}
      <div className="rounded border p-6 text-gray-500">
        （チームビュー：準備中）
      </div>
    </div>
  );
}
