// components/mypage/team/TeamContainer.tsx
"use client";

import { useEffect, useState } from "react";
import TeamLanding from "@/components/mypage/team/TeamLanding";
import TeamLoginModal from "@/components/teamauth/TeamLoginModal";
import TeamRegisterModal from "@/components/teamauth/TeamRegisterModal";
import GearMenu from "@/components/common/GearMenu";
import TeamSettingsModal from "@/components/teamaccount/TeamSettingsModal";
import TimelineView from "@/components/mypage/team/timeline/TimelineView";

import { useTeamMembers } from "@/components/mypage/team/timeline/useTeamMembers";
import { useTeamTimelineData } from "@/components/mypage/team/timeline/useTeamTimelineData";

import FormModal from "@/components/common/modal/FormModal"; // ← 追加（BaseModalの代わりに使用）

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
  const [showTeamSettings, setShowTeamSettings] = useState(false);

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

  // メンバーは専用API（/api/team/members）から常に取得
  const {
    members,
    loading: membersLoading,
    error: membersError,
  } = useTeamMembers(status === "authenticated");

  // スケジュールは既存APIから取得
  const {
    schedules,
    loading: schedulesLoading,
    error: schedulesError,
  } = useTeamTimelineData(status === "authenticated");

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
    return <div className="p-4" />;
  }

  if (status === "unauthenticated") {
    return (
      <div className="p-4">
        {/* 未ログインビュー */}
        <TeamLanding
          onCreateClick={() => setShowTeamRegister(true)}
          onJoinClick={() => setShowTeamLogin(true)}
        />

        {/* Login（FormModal に置き換え） */}
        <FormModal
          open={showTeamLogin}
          onClose={() => setShowTeamLogin(false)}
          backdropProps={{ className: "fixed inset-0 z-[1000] bg-black/40" }}
          containerProps={{
            className: "fixed inset-0 grid place-items-center p-4",
          }}
        >
          <TeamLoginModal
            onClose={() => setShowTeamLogin(false)}
            onLoggedIn={(t) => {
              setTeam(t);
              setStatus("authenticated");
              setShowTeamLogin(false);
            }}
          />
        </FormModal>

        {/* Register（FormModal に置き換え） */}
        <FormModal
          open={showTeamRegister}
          onClose={() => setShowTeamRegister(false)}
          backdropProps={{ className: "fixed inset-0 z-[1000] bg-black/40" }}
          containerProps={{
            className: "fixed inset-0 grid place-items-center p-4",
          }}
        >
          <TeamRegisterModal
            onClose={() => setShowTeamRegister(false)}
            onRegistered={(t) => {
              setTeam(t);
              setStatus("authenticated");
              setShowTeamRegister(false);
            }}
          />
        </FormModal>
      </div>
    );
  }

  // 認証済みビュー
  const displayTeamName = team?.team_name ?? team?.team_login_id ?? "Team";

  const isLoading = membersLoading || schedulesLoading;
  const firstError = membersError || schedulesError;

  return (
    <div className="p-4">
      {/* ヘッダー */}
      <div className="mb-4 flex items-center justify-between text-gray-800">
        <div>
          <h2 className="text-xl font-semibold">Team Schedule</h2>
        </div>

        {/* 右側：共通 GearMenu（非制御モード） */}
        <GearMenu
          displayName={displayTeamName}
          onEdit={() => setShowTeamSettings(true)}
          onConfirmLogout={handleLogout}
          labels={{
            edit: "チーム情報の変更",
            logout: "退出",
            confirmMessage: "退出しますか？",
            confirmLabel: "OK",
            cancelLabel: "キャンセル",
          }}
        />
      </div>

      {/* タイムラインビュー */}
      <div className="rounded border p-3">
        {isLoading ? (
          <div className="p-6 text-center text-sm text-gray-500">
            読み込み中...
          </div>
        ) : firstError ? (
          <div className="p-6 text-center text-sm text-red-500">
            読み込みに失敗しました：{firstError}
          </div>
        ) : members.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-500">
            メンバーがいません。
          </div>
        ) : (
          <TimelineView members={members} schedules={schedules} />
        )}
      </div>

      {/* Team 設定モーダル（FormModal に置き換え） */}
      <FormModal
        open={showTeamSettings}
        onClose={() => setShowTeamSettings(false)}
        backdropProps={{ className: "fixed inset-0 z-[1000] bg-black/40" }}
        containerProps={{
          className: "fixed inset-0 grid place-items-center p-4",
        }}
      >
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
      </FormModal>
    </div>
  );
}
