// @/components/auth/LoginModal.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/router"; // Pages Router
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import PasswordInput from "@/components/common/PasswordInput";
import ProgressDialog from "@/components/common/modal/ProgressDialog";

export interface LoginModalProps {
  onClose: () => void;
}

export default function LoginModal({ onClose }: LoginModalProps) {
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");

  // フォーム上のエラー
  const [generalError, setGeneralError] = useState<string | null>(null);

  // ProgressDialog
  const [progressOpen, setProgressOpen] = useState(false);
  const [progressMessage, setProgressMessage] = useState<string | undefined>(
    undefined
  );

  const handleLogin = async () => {
    // 最小バリデーション
    if (userId.trim() === "" || password.trim() === "") {
      setGeneralError("USER_ID と PASSWORD を入力してください。");
      return;
    }

    setGeneralError(null);

    // 待機モーダル（操作不可、ボタン無し）を表示
    setProgressMessage("ログイン中です…");
    setProgressOpen(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ login_id: userId, password }),
      });

      if (!res.ok) {
        let message = "ログインに失敗しました。もう一度お試しください。";
        try {
          const json = await res.json();
          if (json?.message) message = json.message;
        } catch {}
        // 失敗：待機モーダルを閉じて、フォームにエラー表示
        setProgressOpen(false);
        setGeneralError(message);
        return;
      }

      // 成功：そのまま遷移（ProgressDialogは前面に残り、操作凍結）
      setProgressMessage("マイページへ移動中…");
      // onClose() はせず、遷移完了（アンマウント）で自然に閉じる
      const ok = await router.replace("/mypage");
      if (!ok) throw new Error("NAVIGATE_FAIL");
    } catch {
      // 失敗：待機モーダルを閉じて、フォームにエラー表示
      setProgressOpen(false);
      setGeneralError(
        "ネットワークエラーが発生しました。時間をおいて再度お試しください。"
      );
    }
  };

  return (
    <div
      className="w-full max-w-sm rounded-lg bg-white shadow-md p-6 md:p-8"
      role="dialog"
      aria-label="ログイン"
    >
      <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
        ログイン
      </h2>

      {/* フォーム上のエラー表示 */}
      {generalError && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 text-center">
          {generalError}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            ・USER_ID
          </label>
          <Input
            value={userId}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setUserId(e.target.value)
            }
            placeholder="USER_ID"
            className="w-full"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            ・PASSWORD
          </label>
          <PasswordInput
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
            placeholder="PASSWORD"
            className="w-full"
          />
        </div>
      </div>

      {/* 2カラム中央寄せ */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="flex justify-center">
          <Button variant="secondary" onClick={onClose}>
            閉じる
          </Button>
        </div>
        <div className="flex justify-center">
          <Button variant="primary" onClick={handleLogin}>
            ログイン
          </Button>
        </div>
      </div>

      {/* 待機専用 ProgressDialog（ボタン無し・Esc/Backdrop 無効） */}
      <ProgressDialog
        open={progressOpen}
        status="processing"
        actions="none" // ← 追加（ボタン無しモード）
        message={progressMessage} // 「ログイン中…」「移動中…」
        // Esc/Backdrop はデフォルト無効だから何も渡さなくてOK
      />
    </div>
  );
}
