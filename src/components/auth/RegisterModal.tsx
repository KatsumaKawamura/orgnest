// @/components/auth/RegisterModal.tsx
"use client";

import { useRouter } from "next/router"; // Pages Router
import { useState } from "react";
import RegisterFormCard from "@/components/auth/RegisterFormCard";
import RegisterReviewDialog from "@/components/auth/RegisterReviewDialog";
import Dialog from "@/components/common/modal/Dialog";
import ProgressDialog from "@/components/common/modal/ProgressDialog";
import { useAuthForm } from "@/hooks/forms/useAuthForm";

type ViewMode = "form" | "review";

export interface RegisterModalProps {
  onClose: () => void;
}

export default function RegisterModal({ onClose }: RegisterModalProps) {
  const router = useRouter();
  const vm = useAuthForm({ mode: "create" });

  const [mode, setMode] = useState<ViewMode>("form");
  const [generalError, setGeneralError] = useState<string | null>(null);

  // ProgressDialog の状態
  const [progressOpen, setProgressOpen] = useState(false);
  const [progressStatus, setProgressStatus] = useState<
    "processing" | "done" | "error"
  >("processing");
  const [progressMessage, setProgressMessage] = useState<string | undefined>(
    undefined
  );

  // キャンセル確認用
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleToReview = () => {
    setGeneralError(null);
    setMode("review");
  };

  const doRegister = async () => {
    // 登録処理中のインジケータを表示
    setGeneralError(null);
    setProgressMessage("アカウントを作成しています…");
    setProgressStatus("processing");
    setProgressOpen(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          login_id: vm.values.userId,
          password: vm.values.password,
          contact: vm.values.contact || null,
          user_name: vm.values.userName || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const code = data?.error || "INTERNAL_ERROR";

        if (code === "LOGIN_ID_TAKEN")
          setGeneralError("この USER_ID は既に使用されています");
        else if (code === "LOGIN_ID_INVALID")
          setGeneralError("USER_ID の形式が不正です");
        else if (code === "PASSWORD_INVALID")
          setGeneralError("PASSWORD の形式が不正です");
        else if (code === "INVALID_PAYLOAD")
          setGeneralError("入力内容を確認してください");
        else setGeneralError("登録処理でエラーが発生しました");

        setProgressMessage(generalError ?? "エラーが発生しました");
        setProgressStatus("error");
        return;
      }

      // 成功 → 完了表示（OK で遷移させる）
      setProgressMessage("登録が完了しました。マイページへ移動できます。");
      setProgressStatus("done");
    } catch {
      setGeneralError("ネットワークエラーが発生しました");
      setProgressMessage("ネットワークエラーが発生しました");
      setProgressStatus("error");
    }
  };

  // 入力が1つでもあれば true（touched ではなく値の有無で判定）
  const hasAnyInput =
    !!vm.values.userId ||
    !!vm.values.password ||
    !!vm.values.confirmPassword ||
    !!vm.values.contact ||
    !!vm.values.userName;

  // Form 側のキャンセル押下時
  const handleCancelFromForm = () => {
    if (hasAnyInput) setShowCancelConfirm(true); // ワンクッション
    else onClose(); // 即閉
  };

  return (
    <>
      {mode === "form" && (
        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow">
          <RegisterFormCard
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
        </div>
      )}

      {mode === "review" && (
        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow">
          <RegisterReviewDialog
            values={vm.values}
            onBack={() => setMode("form")}
            onConfirm={doRegister}
          />
        </div>
      )}

      {/* キャンセル確認ダイアログ（別モーダル重ね） */}
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

      {/* 進捗・完了・エラー用の共通ダイアログ */}
      <ProgressDialog
        open={progressOpen}
        status={progressStatus}
        message={progressMessage}
        onClose={() => {
          // error のクローズ
          setProgressOpen(false);
        }}
        onOk={async () => {
          // ✅ OK 押下後：遷移完了まで「処理中」でブロックし続ける
          setProgressStatus("processing");
          setProgressMessage("ログインしてマイページへ移動中…");
          try {
            const ok = await router.push("/mypage"); // resolve: true/false
            if (!ok) {
              throw new Error("NAVIGATE_CANCELLED");
            }
            // 遷移成功時はページアンマウントで自然に閉じる（ここで閉じない）
            // onClose(); は不要
          } catch {
            setGeneralError(
              "遷移に失敗しました。ネットワークをご確認ください。"
            );
            setProgressMessage("遷移に失敗しました。再試行してください。");
            setProgressStatus("error");
          }
        }}
        onRetry={() => {
          // 再試行：再び doRegister を実行
          doRegister();
        }}
        okLabel="マイページへ"
        retryLabel="再試行"
        closeLabel="閉じる"
      />
    </>
  );
}
