// components/teamauth/TeamRegisterModal.tsx
"use client";

import { useState } from "react";
import TeamRegisterFormCard from "@/components/teamauth/TeamRegisterFormCard";
import TeamRegisterReviewDialog from "@/components/teamauth/TeamRegisterReviewDialog";
import ProgressDialog from "@/components/common/modal/ProgressDialog";
import Dialog from "@/components/common/modal/Dialog"; // 無印と同じ Confirm 用
import { useTeamAuthForm } from "@/hooks/forms/useTeamAuthForm";

type ViewMode = "form" | "review";

export interface TeamRegisterModalProps {
  onClose: () => void;
  onRegistered?: (team: { team_id: string; team_name: string | null }) => void;
}

export default function TeamRegisterModal({
  onClose,
  onRegistered,
}: TeamRegisterModalProps) {
  const [mode, setMode] = useState<ViewMode>("form");
  const [generalError, setGeneralError] = useState<string | null>(null);

  // ProgressDialog の状態
  const [progressOpen, setProgressOpen] = useState(false);
  const [progressStatus, setProgressStatus] = useState<
    "processing" | "done" | "error"
  >("processing");
  const [progressMessage, setProgressMessage] = useState<string | undefined>();

  // OK押下時に行う後続処理（OKゲート用）
  const [afterOk, setAfterOk] = useState<null | {
    kind: "registered";
    payload: { team_id: string; team_name: string | null };
  }>(null);

  // キャンセル確認用（無印踏襲：入力ありなら confirm）
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // ---- フォーム：Team 版フック ----
  const vm = useTeamAuthForm({ mode: "create" });

  // ---- 画面遷移制御（無印踏襲：canSubmit の再チェックはしない）----
  const handleToReview = () => {
    setGeneralError(null);
    setMode("review");
  };

  const doRegister = async () => {
    setGeneralError(null);
    setProgressMessage("チームを作成しています…");
    setProgressStatus("processing");
    setProgressOpen(true);

    try {
      const res = await fetch("/api/team/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          team_login_id: vm.values.teamId.trim(),
          password: vm.values.password,
          contact: vm.values.contact || null,
          team_name: vm.values.teamName || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const code = data?.error || "INTERNAL_ERROR";

        let msg = "登録処理でエラーが発生しました";
        if (code === "LOGIN_ID_TAKEN")
          msg = "この TEAM_ID は既に使用されています";
        else if (code === "LOGIN_ID_INVALID") msg = "TEAM_ID の形式が不正です";
        else if (code === "PASSWORD_INVALID") msg = "PASSWORD の形式が不正です";
        else if (code === "INVALID_PAYLOAD") msg = "入力内容を確認してください";

        setProgressMessage(msg);
        setProgressStatus("error");
        setGeneralError(msg);
        return;
      }

      const data = await res.json(); // { ok:true, team_id, team_login_id }
      setProgressMessage("登録が完了しました。OKでチーム画面に切り替えます。");
      setProgressStatus("done");

      // ✅ 無印踏襲：成功直後に閉じず、OK押下で後続（親へ通知→閉じる）
      setAfterOk({
        kind: "registered",
        payload: {
          team_id: data?.team_id ?? vm.values.teamId.trim(),
          team_name: vm.values.teamName || null,
        },
      });
    } catch {
      setGeneralError("ネットワークエラーが発生しました");
      setProgressMessage("ネットワークエラーが発生しました");
      setProgressStatus("error");
    }
  };

  // 入力が1つでもあれば true（touched ではなく値の有無で判定）
  const hasAnyInput =
    !!vm.values.teamId ||
    !!vm.values.password ||
    !!vm.values.confirmPassword ||
    !!vm.values.contact ||
    !!vm.values.teamName;

  const handleCancelFromForm = () => {
    if (hasAnyInput) {
      setShowCancelConfirm(true); // 無印と同じく確認を挟む
    } else {
      onClose();
    }
  };

  return (
    <>
      {mode === "form" && (
        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow">
          <TeamRegisterFormCard
            values={vm.values}
            setters={vm.setters}
            fieldErrors={vm.fieldErrors}
            availability={vm.availability}
            checking={vm.checking}
            canSubmit={vm.canSubmit}
            onCancel={handleCancelFromForm}
            onSubmit={handleToReview}
            touched={vm.touched}
            touch={vm.touch}
          />
          {generalError && (
            <p
              className="mt-3 text-center text-sm text-red-600"
              aria-live="polite"
            >
              {generalError}
            </p>
          )}
        </div>
      )}

      {mode === "review" && (
        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow">
          <TeamRegisterReviewDialog
            values={vm.values}
            onBack={() => setMode("form")}
            onConfirm={doRegister}
          />
        </div>
      )}

      {/* キャンセル確認ダイアログ（無印踏襲） */}
      <Dialog
        open={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        variant="confirm"
        tone="default"
        title="入力内容を破棄して閉じますか？"
        message="フォームへの入力内容は失われます。"
        cancelLabel="戻る"
        confirmLabel="閉じる"
        onConfirm={() => {
          setShowCancelConfirm(false);
          onClose();
        }}
      />

      {/* 進捗・完了・エラー用の共通ダイアログ（OKゲート） */}
      <ProgressDialog
        open={progressOpen}
        status={progressStatus}
        message={progressMessage}
        onClose={() => {
          // error のクローズ
          if (progressStatus === "error") setProgressOpen(false);
        }}
        onOk={() => {
          // ✅ OK押下時：親へ通知 → モーダルを閉じる
          if (afterOk?.kind === "registered") {
            onRegistered?.(afterOk.payload);
          }
          setAfterOk(null);
          setProgressOpen(false);
          onClose();
        }}
        onRetry={() => {
          // 再試行
          doRegister();
        }}
        okLabel="OK"
        retryLabel="再試行"
        closeLabel="閉じる"
      />
    </>
  );
}
