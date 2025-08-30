// @/components/teamauth/TeamLoginModal.tsx
"use client";

import { useState } from "react";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import PasswordInput from "@/components/common/PasswordInput";
import ProgressDialog from "@/components/common/modal/ProgressDialog";

export interface TeamLoginModalProps {
  onClose: () => void;
  /** Phase A: 成功後、擬似refreshに使う暫定データを親へ返す */
  onLoggedIn?: (team: { team_id: string; team_name: string | null }) => void;
}

export default function TeamLoginModal({
  onClose,
  onLoggedIn,
}: TeamLoginModalProps) {
  const [teamLoginId, setTeamLoginId] = useState("");
  const [password, setPassword] = useState("");

  // フォーム上のエラー
  const [generalError, setGeneralError] = useState<string | null>(null);

  // ProgressDialog
  const [progressOpen, setProgressOpen] = useState(false);
  const [progressMessage, setProgressMessage] = useState<string | undefined>(
    undefined
  );

  const handleLogin = async () => {
    // 最小バリデーション（USER版踏襲）
    if (teamLoginId.trim() === "" || password.trim() === "") {
      setGeneralError("TEAM_ID と PASSWORD を入力してください。");
      return;
    }

    setGeneralError(null);

    // 待機モーダル（操作不可、ボタン無し）を表示
    setProgressMessage("チームに参加中です…");
    setProgressOpen(true);

    try {
      const res = await fetch("/api/team/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        // USERver.踏襲: 200 { ok: true } を想定
        body: JSON.stringify({ team_login_id: teamLoginId, password }),
        credentials: "same-origin",
      });

      if (!res.ok) {
        let message = "ログインに失敗しました。もう一度お試しください。";
        try {
          // USERver.は {error:string} を返すため message フォールバック
          const json = await res.json();
          if (json?.message) message = json.message;
          else if (json?.error) message = json.error;
        } catch {}
        // 失敗：待機モーダルを閉じて、フォームにエラー表示
        setProgressOpen(false);
        setGeneralError(message);
        return;
      }

      // 成功：Phase Aはタブ内切替（擬似refresh）
      setProgressMessage("タブを切り替えています…");

      // 親へ暫定データを通知（後続で /api/team/me に置換予定）
      onLoggedIn?.({ team_id: teamLoginId, team_name: null });

      // モーダルを閉じる（親制御）
      onClose();
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
      aria-label="チームに参加"
    >
      <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
        チームに参加
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
            TEAM_ID
          </label>
          <Input
            value={teamLoginId}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setTeamLoginId(e.target.value)
            }
            placeholder="TEAM_ID"
            className="w-full"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            PASSWORD
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

      {/* 2カラム中央寄せ（USER版踏襲） */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="flex justify-center">
          <Button variant="secondary" onClick={onClose}>
            閉じる
          </Button>
        </div>
        <div className="flex justify-center">
          <Button variant="primary" onClick={handleLogin}>
            参加する
          </Button>
        </div>
      </div>

      {/* 待機専用 ProgressDialog（ボタン無し・Esc/Backdrop 無効） */}
      <ProgressDialog
        open={progressOpen}
        status="processing"
        actions="none"
        message={progressMessage} // 「参加中…」「切替中…」
      />
    </div>
  );
}
