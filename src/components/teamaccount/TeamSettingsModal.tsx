// @/components/teamaccount/TeamSettingsModal.tsx
"use client";

import { useEffect, useState } from "react";
import TeamSettingsFormCard from "@/components/teamaccount/TeamSettingsFormCard";
import { useTeamAuthForm } from "@/hooks/forms/useTeamAuthForm";
import ProgressDialog from "@/components/common/modal/ProgressDialog";
import Dialog from "@/components/common/modal/Dialog";

export type TeamMe = {
  team_login_id: string;
  team_name: string | null;
  contact: string | null;
};

export interface TeamSettingsModalProps {
  onClose: () => void;
  initial?: TeamMe;
  onUpdated?: (me: TeamMe) => void;
}

type Phase = "loading" | "form";

export default function TeamSettingsModal({
  onClose,
  initial,
  onUpdated,
}: TeamSettingsModalProps) {
  const [me, setMe] = useState<TeamMe | null>(initial ?? null);
  const [phase, setPhase] = useState<Phase>(initial ? "form" : "loading");
  const [generalError, setGeneralError] = useState<string | null>(null);

  // 変更ありキャンセル確認ダイアログ（無印準拠）
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // 初期値が無ければ /api/team/me から取得（無印準拠の構造で Team 版に差し替え）
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (initial) return;
      try {
        const res = await fetch("/api/team/me", {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
        });
        if (!mounted) return;
        if (!res.ok) {
          setGeneralError("チーム情報の取得に失敗しました");
          setPhase("form");
          return;
        }
        const data = await res.json();
        // /api/team/me のレスポンス: { ok: true, team: { team_id, team_login_id, team_name, contact } }
        const t = data?.team ?? {};
        setMe({
          team_login_id: t.team_login_id,
          team_name: t.team_name,
          contact: t.contact,
        });
        setPhase("form");
      } catch {
        if (!mounted) return;
        setGeneralError("ネットワークエラーが発生しました");
        setPhase("form");
      }
    })();
    return () => {
      mounted = false;
    };
  }, [initial]);

  // Team 用のフォームフック（無印の useAuthForm を Team に置き換え）
  const vm = useTeamAuthForm({ mode: "update", initial: me ?? undefined });

  // ProgressDialog（更新中/完了/エラー）— 無印準拠
  const [progressOpen, setProgressOpen] = useState(false);
  const [progressStatus, setProgressStatus] = useState<
    "processing" | "done" | "error"
  >("processing");
  const [progressMessage, setProgressMessage] = useState<string | undefined>(
    undefined
  );

  const handleSave = async () => {
    setGeneralError(null);
    setProgressOpen(true);
    setProgressStatus("processing");
    setProgressMessage("チーム情報を更新しています…");

    try {
      const body: Record<string, unknown> = {};
      if (me && vm.values.teamId !== me.team_login_id)
        body.team_login_id = vm.values.teamId;
      if (vm.values.password) body.password = vm.values.password;
      if ((vm.values.teamName || null) !== (me?.team_name ?? null))
        body.team_name = vm.values.teamName || null;
      if ((vm.values.contact || null) !== (me?.contact ?? null))
        body.contact = vm.values.contact || null;

      if (Object.keys(body).length === 0) {
        // 変更なし：Progress を閉じて即クローズ（無印準拠）
        setProgressOpen(false);
        onClose();
        return;
      }

      const res = await fetch("/api/team/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const code = data?.error || "INTERNAL_ERROR";
        if (code === "LOGIN_ID_TAKEN")
          setGeneralError("この TEAM_ID は既に使用されています");
        else if (code === "LOGIN_ID_INVALID")
          setGeneralError("TEAM_ID の形式が不正です");
        else if (code === "PASSWORD_TOO_SHORT")
          setGeneralError("PASSWORD が短すぎます");
        else if (code === "NO_CHANGES") setGeneralError("変更がありません");
        else if (code === "UNAUTHORIZED") setGeneralError("認証が必要です");
        else setGeneralError("更新に失敗しました");

        setProgressMessage("更新に失敗しました");
        setProgressStatus("error");
        return;
      }

      const data = await res.json();
      // /api/team/update のレスポンス: { team: { team_login_id, team_name, contact } }
      const updated: TeamMe = {
        team_login_id: data.team.team_login_id,
        team_name: data.team.team_name,
        contact: data.team.contact,
      };
      setMe(updated);
      onUpdated?.(updated);

      setProgressMessage("更新が完了しました。");
      setProgressStatus("done");
    } catch {
      setGeneralError("ネットワークエラーが発生しました");
      setProgressMessage("ネットワークエラーが発生しました");
      setProgressStatus("error");
    }
  };

  // 変更がある場合だけキャンセル確認（無印準拠）
  const handleCancelFromForm = () => {
    if (vm.dirty) setShowCancelConfirm(true);
    else onClose();
  };

  return (
    <>
      {/* Loading も無印統一の白カード */}
      {phase === "loading" && (
        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow">
          <p className="text-sm text-gray-700 text-center">読み込み中…</p>
        </div>
      )}

      {phase === "form" && me && (
        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow">
          <TeamSettingsFormCard
            values={vm.values}
            setters={vm.setters}
            fieldErrors={vm.fieldErrors}
            availability={vm.availability}
            checking={vm.checking}
            canSubmit={vm.canSubmit}
            dirty={vm.dirty}
            onCancel={handleCancelFromForm}
            onSubmit={handleSave}
            generalError={generalError}
          />
        </div>
      )}

      {/* ProgressDialog（更新中/完了/エラー） */}
      <ProgressDialog
        open={progressOpen}
        status={progressStatus}
        message={progressMessage}
        onClose={() => setProgressOpen(false)} // error: 閉じる
        onRetry={handleSave} // error: 再試行
        onOk={() => {
          setProgressOpen(false);
          onClose();
        }} // done: OKで閉じる
      />

      {/* 変更破棄の確認ダイアログ */}
      <Dialog
        open={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        variant="confirm"
        tone="default"
        title="変更内容を破棄して閉じますか？"
        message="フォームの変更内容は失われます。"
        cancelLabel="戻る"
        confirmLabel="閉じる"
        onConfirm={() => {
          setShowCancelConfirm(false);
          onClose();
        }}
      />
    </>
  );
}
