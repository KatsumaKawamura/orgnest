// @/components/account/SettingsFormCard.tsx
"use client";

import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import PasswordInput from "@/components/common/PasswordInput";
import type { UseAuthFormReturn } from "@/hooks/forms/useAuthForm";
import { errorMessagesJA } from "@/ui/i18n/errorMessages";

type Values = UseAuthFormReturn["values"];
type Setters = UseAuthFormReturn["setters"];
type FieldErrors = UseAuthFormReturn["fieldErrors"];
type Availability = UseAuthFormReturn["availability"];

export interface SettingsFormCardProps {
  values: Values;
  setters: Setters;
  fieldErrors: FieldErrors;
  availability: Availability;
  checking: boolean;
  canSubmit: boolean;
  dirty: boolean;
  busy?: boolean;
  generalError?: string | null;
  onCancel: () => void;
  onSubmit: () => void;
}

export default function SettingsFormCard({
  values,
  setters,
  fieldErrors,
  availability,
  checking,
  canSubmit,
  dirty,
  busy = false,
  generalError,
  onCancel,
  onSubmit,
}: SettingsFormCardProps) {
  const userIdHelp = (() => {
    if (checking) return <span className="text-gray-500">確認中…</span>;
    if (availability === "available")
      return <span className="text-green-600">使用可能です</span>;
    if (availability === "taken")
      return <span className="text-red-600">使用できません</span>;
    return null;
  })();

  return (
    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow">
      <h2 className="text-lg font-semibold text-gray-900 text-center">
        アカウント設定
      </h2>

      <div className="mt-5 space-y-4">
        {/* USER_ID */}
        <label className="block">
          <span className="mb-1 block text-sm text-gray-700">USER_ID</span>
          <Input value={values.userId} onValueChange={setters.setUserId} />
          <div className="mt-1 text-xs">
            {fieldErrors.userId ? (
              <span className="text-red-600">
                {errorMessagesJA[fieldErrors.userId]}
              </span>
            ) : (
              userIdHelp
            )}
          </div>
        </label>

        {/* PASSWORD（空は未変更扱い） */}
        <label className="block">
          <span className="mb-1 block text-sm text-gray-700">
            新しい PASSWORD（任意）
          </span>
          <PasswordInput
            value={values.password}
            onValueChange={setters.setPassword}
            placeholder="変更しない場合は空のまま"
          />
          <div className="mt-1 text-xs">
            {fieldErrors.password ? (
              <span className="text-red-600">
                {errorMessagesJA[fieldErrors.password]}
              </span>
            ) : (
              <span className="text-gray-500">
                半角英数字・記号のみ（スペース不可）
              </span>
            )}
          </div>
        </label>

        {/* CONFIRM */}
        <label className="block">
          <span className="mb-1 block text-sm text-gray-700">
            PASSWORD（確認）
          </span>
          <PasswordInput
            value={values.confirmPassword}
            onValueChange={setters.setConfirmPassword}
            placeholder="パスワード変更時のみ入力"
          />
          <div className="mt-1 text-xs">
            {fieldErrors.confirmPassword ? (
              <span className="text-red-600">
                {errorMessagesJA[fieldErrors.confirmPassword]}
              </span>
            ) : (
              <span className="text-gray-500">変更時のみ必要</span>
            )}
          </div>
        </label>

        {/* CONTACT（任意） */}
        <label className="block">
          <span className="mb-1 block text-sm text-gray-700">
            連絡先（任意）
          </span>
          <Input
            value={values.contact}
            onValueChange={setters.setContact}
            placeholder="メールアドレスなど"
          />
        </label>

        {/* USER_NAME（任意） */}
        <label className="block">
          <span className="mb-1 block text-sm text-gray-700">
            表示名（任意）
          </span>
          <Input
            value={values.userName}
            onValueChange={setters.setUserName}
            placeholder="例: 山田 太郎"
          />
        </label>

        {generalError && (
          <div className="mt-2 text-center text-sm text-red-600">
            {generalError}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-6 flex items-center justify-center gap-2">
        <Button variant="secondary" onClick={onCancel} disabled={busy}>
          キャンセル
        </Button>
        <Button onClick={onSubmit} disabled={!canSubmit || !dirty || busy}>
          {busy ? "保存中…" : "保存する"}
        </Button>
      </div>
    </div>
  );
}
