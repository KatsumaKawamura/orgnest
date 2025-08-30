// @/components/account/SettingsModal.tsx
"use client";

import { useEffect, useState } from "react";
import SettingsFormCard from "@/components/account/SettingsFormCard";
import { useAuthForm } from "@/hooks/forms/useAuthForm";
import ProgressDialog from "@/components/common/modal/ProgressDialog";
import Dialog from "@/components/common/modal/Dialog"; // ← 追加

export type Me = {
  login_id: string;
  user_name: string | null;
  contact: string | null;
};

export interface SettingsModalProps {
  onClose: () => void;
  initial?: Me;
  onUpdated?: (me: Me) => void;
}

type Phase = "loading" | "form";

export default function SettingsModal({
  onClose,
  initial,
  onUpdated,
}: SettingsModalProps) {
  const [me, setMe] = useState<Me | null>(initial ?? null);
  const [phase, setPhase] = useState<Phase>(initial ? "form" : "loading");
  const [generalError, setGeneralError] = useState<string | null>(null);

  // 変更ありキャンセル確認ダイアログ（Register と同じ発想）
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // 初期値が無ければ /api/account/me から取得
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (initial) return;
      try {
        const res = await fetch("/api/account/me", {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
        });
        if (!mounted) return;
        if (!res.ok) {
          setGeneralError("ユーザー情報の取得に失敗しました");
          setPhase("form");
          return;
        }
        const data = await res.json();
        setMe({
          login_id: data.login_id,
          user_name: data.user_name,
          contact: data.contact,
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

  const vm = useAuthForm({ mode: "update", initial: me ?? undefined });

  // ProgressDialog（更新中/完了/エラー）
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
    setProgressMessage("アカウント情報を更新しています…");

    try {
      const body: Record<string, unknown> = {};
      if (me && vm.values.userId !== me.login_id)
        body.login_id = vm.values.userId;
      if (vm.values.password) body.password = vm.values.password;
      if ((vm.values.userName || null) !== (me?.user_name ?? null))
        body.user_name = vm.values.userName || null;
      if ((vm.values.contact || null) !== (me?.contact ?? null))
        body.contact = vm.values.contact || null;

      if (Object.keys(body).length === 0) {
        // 変更なし：Progress を閉じて即クローズ
        setProgressOpen(false);
        onClose();
        return;
      }

      const res = await fetch("/api/account/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const code = data?.error || "INTERNAL_ERROR";
        if (code === "LOGIN_ID_TAKEN")
          setGeneralError("この USER_ID は既に使用されています");
        else if (code === "LOGIN_ID_INVALID")
          setGeneralError("USER_ID の形式が不正です");
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
      const updated: Me = {
        login_id: data.user.login_id,
        user_name: data.user.user_name,
        contact: data.user.contact,
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

  // ← Register と同じ思想：変更がある場合だけ、キャンセルにクッション
  const handleCancelFromForm = () => {
    if (vm.dirty) setShowCancelConfirm(true);
    else onClose();
  };

  return (
    <>
      {/* Loading も Register と同じ白カードで統一 */}
      {phase === "loading" && (
        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow">
          <p className="text-sm text-gray-700 text-center">読み込み中…</p>
        </div>
      )}

      {phase === "form" && me && (
        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow">
          <SettingsFormCard
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

      {/* 変更破棄の確認ダイアログ（Register と同じ UX） */}
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
