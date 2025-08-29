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
    return (
      <span className="text-gray-500">小文字英字と _ のみ／1〜32文字</span>
    );
  })();

  const HintRow = ({ children }: { children: React.ReactNode }) => (
    <div
      className="mt-1 text-xs h-5 flex items-center"
      aria-live="polite"
      aria-atomic="true"
    >
      {children ?? <span className="invisible">placeholder</span>}
    </div>
  );

  // ※ 外枠（bg-white / shadow / padding）は SettingsModal 側で付与
  return (
    <>
      <h2 className="text-lg font-semibold text-gray-900 text-center">
        アカウント情報の変更
      </h2>

      <div className="mt-5 space-y-4">
        {/* USER_ID */}
        <label className="block">
          <span className="mb-1 block text-sm text-gray-700">・USER_ID</span>
          <Input
            value={values.userId}
            onValueChange={setters.setUserId}
            placeholder="USER_ID"
          />
          <HintRow>
            {fieldErrors.userId ? (
              <span className="text-red-600">
                {errorMessagesJA[fieldErrors.userId]}
              </span>
            ) : (
              userIdHelp
            )}
          </HintRow>
        </label>

        {/* PASSWORD（任意） */}
        <label className="block">
          <span className="mb-1 block text-sm text-gray-700">・PASSWORD</span>
          <PasswordInput
            value={values.password}
            onValueChange={setters.setPassword}
            placeholder="PASSWORD"
          />
          <HintRow>
            {fieldErrors.password ? (
              <span className="text-red-600">
                {errorMessagesJA[fieldErrors.password]}
              </span>
            ) : (
              <span className="text-gray-500">
                パスワード変更時のみ入力してください。
              </span>
            )}
          </HintRow>
        </label>

        {/* CONFIRM（任意） */}
        <label className="block">
          <PasswordInput
            value={values.confirmPassword}
            onValueChange={setters.setConfirmPassword}
            placeholder="PASSWORD（確認）"
          />
          <HintRow>
            {fieldErrors.confirmPassword ? (
              <span className="text-red-600">
                {errorMessagesJA[fieldErrors.confirmPassword]}
              </span>
            ) : (
              <span className="text-gray-500">
                パスワード変更時のみ入力してください。
              </span>
            )}
          </HintRow>
        </label>

        {/* CONTACT（任意） */}
        <label className="block">
          <span className="mb-1 block text-sm text-gray-700">・CONTACT</span>
          <Input
            value={values.contact}
            onValueChange={setters.setContact}
            placeholder="E-MAIL"
          />
          <HintRow>
            <span className="text-gray-500">入力は任意です。</span>
          </HintRow>
        </label>

        {/* USER_NAME（任意） */}
        <label className="block">
          <span className="mb-1 block text-sm text-gray-700">・USER_NAME</span>
          <Input
            value={values.userName}
            onValueChange={setters.setUserName}
            placeholder="USER_NAME"
          />
          <HintRow>
            <span className="text-gray-500">入力は任意です。</span>
          </HintRow>
        </label>

        {generalError && (
          <div className="pt-1 text-center text-sm text-red-600">
            {generalError}
          </div>
        )}
      </div>

      {/* Actions：Register と同じ 2 カラム中央寄せ */}
      <div className="mt-6 grid grid-cols-2 gap-3 justify-items-center">
        <Button variant="secondary" onClick={onCancel}>
          キャンセル
        </Button>
        <Button onClick={onSubmit} disabled={!canSubmit || !dirty}>
          更新
        </Button>
      </div>
    </>
  );
}
