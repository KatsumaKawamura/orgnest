"use client";
import { useState } from "react";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";

export default function AccountSettingsModal({
  title,
  initialName,
  initialEmail,
  onClose,
  onUpdated,
}: {
  title: string;
  initialName: string;
  initialEmail: string;
  onClose: () => void;
  onUpdated: (newData: { user_name: string; contact: string }) => void;
}) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_name: name, contact: email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "更新に失敗しました");
      } else {
        onUpdated({ user_name: name, contact: email });
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

  return (
    <>
      {/* メイン：編集モーダル */}
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
        <div className="bg-white p-6 rounded shadow-lg w-96 text-gray-800">
          <h2 className="text-lg font-semibold mb-4">{title}</h2>

          <label className="block text-sm font-medium mb-1">ユーザー名</label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mb-3"
          />

          <label className="block text-sm font-medium mb-1">メール</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-4"
          />

          <div className="flex justify-end space-x-2">
            <Button variant="secondary" size="md" onClick={handleCloseAll}>
              キャンセル
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? "保存中..." : "保存"}
            </Button>
          </div>
        </div>
      </div>

      {/* サブ：保存完了モーダル */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-80 text-center">
            <h2 className="text-lg font-semibold mb-4">保存完了</h2>
            <p className="text-gray-700 mb-6">アカウント情報を更新しました。</p>
            <div className="flex justify-center">
              <Button variant="primary" size="md" onClick={handleCloseAll}>
                OK
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* サブ：エラーモーダル */}
      {errorMessage && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-80 text-center">
            <h2 className="text-lg font-semibold text-red-600 mb-4">エラー</h2>
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
