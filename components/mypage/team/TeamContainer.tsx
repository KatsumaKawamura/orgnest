// components/mypage/team/TeamContainer.tsx
"use client";

import { useState } from "react";
import TeamLanding from "@/components/mypage/team/TeamLanding";
import TeamLoginModal from "@/components/teamauth/TeamLoginModal";
import TeamRegisterModal from "@/components/teamauth/TeamRegisterModal";

type TeamAuthStatus = "loading" | "unauthenticated" | "authenticated";

type TeamInfo = {
  team_id: string;
  team_name: string | null;
};

export default function TeamContainer() {
  // Phase A: 起動時は未ログイン扱い
  const [status, setStatus] = useState<TeamAuthStatus>("unauthenticated");
  const [team, setTeam] = useState<TeamInfo | null>(null);

  // TEAM版 Login/Register モーダル開閉（親制御）
  const [showTeamLogin, setShowTeamLogin] = useState(false);
  const [showTeamRegister, setShowTeamRegister] = useState(false);

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
        <TeamLanding
          onCreateClick={() => setShowTeamRegister(true)}
          onJoinClick={() => setShowTeamLogin(true)}
        />

        {showTeamLogin && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40">
            <TeamLoginModal
              onClose={() => setShowTeamLogin(false)}
              onLoggedIn={(t) => {
                setTeam(t);
                setStatus("authenticated"); // 擬似refresh
                setShowTeamLogin(false);
              }}
            />
          </div>
        )}

        {showTeamRegister && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40">
            <TeamRegisterModal
              onClose={() => setShowTeamRegister(false)}
              onRegistered={(t) => {
                setTeam(t);
                setStatus("authenticated"); // 登録＝即ログイン（A案）
                setShowTeamRegister(false);
              }}
            />
          </div>
        )}
      </div>
    );
  }

  // 認証済み（Phase Aはプレースホルダ表示）
  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {team?.team_name ?? team?.team_id ?? "Team"}
        </h2>
        <button
          type="button"
          className="px-3 py-1 rounded border"
          onClick={() => {
            // 後続フェーズで TeamSettingsModal を接続予定
            console.log("open team settings (next phase)");
          }}
        >
          ⚙
        </button>
      </div>

      <div className="rounded border p-4">
        <p className="text-gray-600">共有スケジュール（準備中）</p>
      </div>
    </div>
  );
}
