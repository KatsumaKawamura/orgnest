// components/mypage/AccountSettingsModal.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Input from "@/components/common/Input";
import PasswordInput from "@/components/common/PasswordInput";
import Button from "@/components/common/Button";

type Props = {
  title: string;
  /** 既存ユーザー情報（user_id/login_id はどちらかが来る想定） */
  initialUserId: string;
  initialLoginId?: string | null;
  initialName: string;
  initialEmail: string;
  onClose: () => void;
  /** 成功後に最新の user を親へ反映 */
  onUpdated: (newData: {
    user_id?: string;
    login_id?: string;
    user_name?: string;
    contact?: string;
  }) => void;
};

export default function AccountSettingsModal({
  title,
  initialUserId,
  initialLoginId,
  initialName,
  initialEmail,
  onClose,
  onUpdated,
}: Props) {
  // USER_ID は login_id を優先（なければ user_id）
  const initialUserIdDisplay = useMemo(
    () =>
      initialLoginId && initialLoginId.length > 0
        ? initialLoginId
        : initialUserId,
    [initialLoginId, initialUserId]
  );

  const [userId, setUserId] = useState(initialUserIdDisplay);
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 簡易バリデーション
  const userIdChanged = userId.trim() !== initialUserIdDisplay;
  const nameChanged = name !== initialName;
  const emailChanged = email !== initialEmail;
  const passwordChanged = password.length > 0;

  const hasAnyChange =
    userIdChanged || nameChanged || emailChanged || passwordChanged;

  const passwordError =
    passwordChanged && password !== passwordConfirm
      ? "PASSWORD（確認）が一致していません"
      : null;

  // 送信
  const handleSave = async () => {
    setErrorMessage(null);

    if (!hasAnyChange) {
      onClose();
      return;
    }
    if (passwordError) return;

    setLoading(true);
    try {
      // 変更点だけ送る
      const payload: any = {};
      if (userIdChanged) {
        // サーバー実装に合わせて、login_id または user_id どちらで扱うか決めてください
        // ここでは login_id として送る運用を推奨（認証IDの意味合いに近い）
        payload.login_id = userId.trim();
      }
      if (nameChanged) payload.user_name = name;
      if (emailChanged) payload.contact = email;
      if (passwordChanged) payload.password = password;

      const res = await fetch("/api/user/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "更新に失敗しました");
      } else {
        // 親へ変更点だけ伝える
        onUpdated(payload);
        setShowSuccess(true);
      }
    } catch {
      setErrorMessage("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseAll = () => {
    setShowSuccess(false);
    setErrorMessage(null);
    onClose();
  };

  // Esc で閉じる（任意）
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleCloseAll();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* メイン：編集モーダル */}
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
        <div className="bg-white p-6 rounded shadow-lg w-[min(92vw,28rem)] text-gray-800">
          <h2 className="text-lg font-semibold mb-4">{title}</h2>

          <label className="block text-sm font-medium mb-1">USER_ID</label>
          <Input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="mb-3"
            placeholder="USER_ID"
          />

          <label className="block text-sm font-medium mb-1">
            PASSWORD（変更する場合のみ）
          </label>
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-2"
            placeholder="NEW_PASSWORD"
            autoComplete="new-password"
          />
          <PasswordInput
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            className="mb-3"
            placeholder="NEW_PASSWORD（確認）"
            autoComplete="new-password"
          />
          {passwordError && (
            <p className="text-xs text-red-600 mb-2">{passwordError}</p>
          )}

          <label className="block text-sm font-medium mb-1">CONTACT</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-3"
            placeholder="通知先メールアドレス"
          />

          <label className="block text-sm font-medium mb-1">USER_NAME</label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mb-5"
            placeholder="アプリ内の表示名"
          />

          <div className="flex justify-end space-x-2">
            <Button variant="secondary" size="md" onClick={handleCloseAll}>
              キャンセル
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleSave}
              disabled={loading || !!passwordError || !hasAnyChange}
            >
              {loading ? "保存中..." : "保存"}
            </Button>
          </div>
        </div>
      </div>

      {/* 保存完了モーダル */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-80 text-center">
            <h2 className="text-lg font-semibold">保存完了</h2>
            <p className="text-gray-700 my-6">アカウント情報を更新しました。</p>
            <div className="flex justify-center">
              <Button variant="primary" size="md" onClick={handleCloseAll}>
                OK
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* エラーモーダル */}
      {errorMessage && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-80 text-center">
            <h2 className="text-lg font-semibold text-red-600 mb-2">エラー</h2>
            <p className="text-gray-700 mb-6">{errorMessage}</p>
            <div className="flex justify-center">
              <Button
                variant="primary"
                size="md"
                onClick={() => setErrorMessage(null)}
              >
                OK
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
