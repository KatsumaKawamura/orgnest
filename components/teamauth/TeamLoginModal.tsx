// components/teamauth/TeamLoginModal.tsx
"use client";

import { useState } from "react";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import PasswordInput from "@/components/common/PasswordInput";
import ProgressDialog from "@/components/common/modal/ProgressDialog";

export interface LoginModalProps {
  onClose: () => void;
  /** ログイン成功後、親（TeamContainer 等）で画面切替したいときに使う（任意） */
  onLoggedIn?: (team: { team_id: string; team_name: string | null }) => void;
}

export default function TeamLoginModal({
  onClose,
  onLoggedIn,
}: LoginModalProps) {
  const [teamId, setTeamId] = useState("");
  const [password, setPassword] = useState("");

  // フォーム上のエラー（無印と同じ運用）
  const [generalError, setGeneralError] = useState<string | null>(null);

  // ProgressDialog（無印と同じ：処理中固定、ボタン無し）
  const [progressOpen, setProgressOpen] = useState(false);
  const [progressMessage, setProgressMessage] = useState<string | undefined>(
    undefined
  );

  const handleLogin = async () => {
    // 最小バリデーション（無印と同様：空チェックのみ）
    if (teamId.trim() === "" || password.trim() === "") {
      setGeneralError("USER_ID と PASSWORD を入力してください。");
      return;
    }

    setGeneralError(null);

    // 待機モーダル（操作不可、ボタン無し）を表示（無印踏襲）
    setProgressMessage("ログイン中です…");
    setProgressOpen(true);

    try {
      const res = await fetch("/api/team/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ team_login_id: teamId.trim(), password }),
      });

      if (!res.ok) {
        let message = "ログインに失敗しました。もう一度お試しください。";
        try {
          const json = await res.json();
          // サーバ側が {error or message} を返す場合は優先
          if (json?.message) message = json.message;
          else if (json?.error) message = String(json.error);
        } catch {}
        // 失敗：待機モーダルを閉じて、フォームにエラー表示（無印踏襲）
        setProgressOpen(false);
        setGeneralError(message);
        return;
      }

      // 成功：Team版はページ遷移しないため、親に通知してモーダルを閉じる
      try {
        const data = await res.json().catch(() => ({}));
        onLoggedIn?.({
          team_id: data?.team_id ?? teamId.trim(),
          team_name: data?.team_name ?? null,
        });
      } finally {
        // 無印では遷移でアンマウントされるが、Teamはここで閉じる
        setProgressOpen(false);
        onClose();
      }
    } catch {
      // 失敗：待機モーダルを閉じて、フォームにエラー表示（無印踏襲）
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
        チームに参加する
      </h2>

      {/* フォーム上のエラー表示（無印踏襲） */}
      {generalError && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 text-center">
          {generalError}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            ・TEAM_ID
          </label>
          <Input
            value={teamId}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setTeamId(e.target.value)
            }
            placeholder="TEAM_ID"
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

      {/* 2カラム中央寄せ（無印踏襲） */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="flex justify-center">
          <Button variant="secondary" onClick={onClose}>
            閉じる
          </Button>
        </div>
        <div className="flex justify-center">
          <Button variant="primary" onClick={handleLogin}>
            参加
          </Button>
        </div>
      </div>

      {/* 待機専用 ProgressDialog（ボタン無し・Esc/Backdrop 無効：無印踏襲） */}
      <ProgressDialog
        open={progressOpen}
        status="processing"
        actions="none"
        message={progressMessage}
      />
    </div>
  );
}
