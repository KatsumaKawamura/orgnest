"use client";

import { useMemo, useRef, useState } from "react";
import FadeModalWrapper from "@/components/common/FadeModalWrapper";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import ProgressModal from "@/components/common/ProgressModal";
import AccountSettingsFormCard, {
  AccountSettingsFormState,
  AccountSettingsDiff,
} from "@/components/mypage/AccountSettingsFormCard";

export type AccountUser = {
  id: string;
  login_id: string;
  user_name?: string | null;
  contact?: string | null;
};

type Props = {
  user?: AccountUser | null;
  onClose: () => void;
  onUpdated: (diff: AccountSettingsDiff) => void;
};

export default function AccountSettingsModal({
  user,
  onClose,
  onUpdated,
}: Props) {
  const [showConfirmDiscard, setShowConfirmDiscard] = useState(false);
  const [progress, setProgress] = useState<"idle" | "processing" | "done">(
    "idle"
  );

  const formRef = useRef<AccountSettingsFormState | null>(null);
  const [formState, setFormState] = useState<AccountSettingsFormState | null>(
    null
  );

  const initial = useMemo(
    () => ({
      login_id: user?.login_id ?? "",
      user_name: user?.user_name ?? "",
      contact: user?.contact ?? "",
    }),
    [user?.login_id, user?.user_name, user?.contact]
  );

  const canSave = !!formState?.canSave;
  const diff = formState?.diff ?? {};
  const hasChanges = !!formState?.hasChanges;

  const requestCancel = () => {
    if (!hasChanges) {
      onClose();
      return;
    }
    setShowConfirmDiscard(true);
  };

  const handleSave = async () => {
    if (!canSave) return;
    setProgress("processing");
    try {
      const res = await fetch("/api/user/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(diff),
      });
      if (!res.ok) throw new Error("Failed to update");
      setProgress("done");
    } catch {
      setProgress("idle");
      alert("更新に失敗しました。時間を置いて再度お試しください。");
    }
  };

  const handleProgressOk = () => {
    if (progress !== "done") return;
    onUpdated(diff);
    onClose();
  };

  const headerDesc = user
    ? "USER_ID・パスワード・氏名・連絡先を編集します"
    : "ユーザー情報を取得しています…";

  return (
    <FadeModalWrapper onClose={onClose} closeOnBackdrop={false} role="dialog">
      <div className="w-[min(92vw,720px)] max-w-[720px] bg-white text-gray-900 rounded-xl shadow-xl flex flex-col">
        {/* Header（線なし） */}
        <div className="px-6 pt-6 pb-4">
          <h2 className="text-lg font-semibold text-center" data-modal-title>
            ユーザー情報の変更
          </h2>
          <p className="sr-only" data-modal-desc>
            {headerDesc}
          </p>
        </div>

        {/* Body（フォーム内に ActionsRow を含む） */}
        <div className="px-6 pb-6">
          <AccountSettingsFormCard
            initial={initial}
            onStateChange={(s) => {
              formRef.current = s;
              setFormState(s);
            }}
            onCancel={requestCancel}
            onSubmit={handleSave}
            submitting={progress === "processing"}
          />
          {!user && (
            <p className="mt-3 text-xs text-gray-500">
              ユーザー情報の読み込み中です。読み込み後に現在値が反映されます。
            </p>
          )}
        </div>
      </div>

      {/* 破棄確認（asChild） */}
      {showConfirmDiscard && (
        <FadeModalWrapper
          onClose={() => setShowConfirmDiscard(false)}
          asChild
          enterSubmits={true}
        >
          <ConfirmDialog
            title="編集内容を破棄しますか？"
            message="保存されていない変更は失われます。"
            onCancel={() => setShowConfirmDiscard(false)}
            onConfirm={() => {
              setShowConfirmDiscard(false);
              onClose();
            }}
            actions={{ align: "center" }}
          />
        </FadeModalWrapper>
      )}

      {/* 進捗（asChild） */}
      {progress !== "idle" && (
        <FadeModalWrapper
          onClose={() => setProgress("idle")}
          asChild
          enterSubmits={true}
        >
          <ProgressModal
            title="アカウント更新"
            status={progress === "processing" ? "processing" : "done"}
            processingText="保存中……"
            doneText="更新が完了しました"
            confirmLabel="OK"
            onConfirm={handleProgressOk}
            actions={{ align: "center" }}
          />
        </FadeModalWrapper>
      )}
    </FadeModalWrapper>
  );
}
