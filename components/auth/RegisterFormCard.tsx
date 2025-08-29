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
type Touched = UseAuthFormReturn["touched"];
type Touch = UseAuthFormReturn["touch"];

export interface RegisterFormCardProps {
  values: Values;
  setters: Setters;
  fieldErrors: FieldErrors;
  availability: Availability; // "unknown" | "available" | "taken" | "error"
  checking: boolean;
  canSubmit: boolean;
  onCancel: () => void;
  onSubmit: () => void;
  touched: Touched;
  touch: Touch;
}

export default function RegisterFormCard({
  values,
  setters,
  fieldErrors,
  availability,
  checking,
  canSubmit,
  onCancel,
  onSubmit,
  touched,
  touch,
}: RegisterFormCardProps) {
  const userIdHelp = (() => {
    if (checking) return <span className="text-gray-500">確認中…</span>;
    if (availability === "available")
      return <span className="text-green-600">使用可能です</span>;
    if (availability === "taken")
      return <span className="text-red-600">使用できません</span>;
    return null; // unknown/error は表示しない
  })();

  // ヒント行を常に一定の高さで確保（1.25rem）
  const HintRow = ({ children }: { children: React.ReactNode }) => (
    <div
      className="mt-1 text-xs h-5 flex items-center"
      aria-live="polite"
      aria-atomic="true"
    >
      {children ?? <span className="invisible">placeholder</span>}
    </div>
  );

  // ※ 外枠（bg-white / shadow / padding）は親（RegisterModal）側で付与する想定
  return (
    <>
      <h2 className="text-lg font-semibold text-gray-900 text-center">
        アカウント登録
      </h2>

      <div className="mt-4 space-y-4">
        {/* USER_ID */}
        <label className="block">
          <span className="mb-1 block text-sm text-gray-700">・USER_ID</span>
          <Input
            value={values.userId}
            onValueChange={setters.setUserId}
            onBlur={touch.userId}
            placeholder="USER_ID"
          />
          <HintRow>
            {touched.userId && fieldErrors.userId ? (
              <span className="text-red-600">
                {errorMessagesJA[fieldErrors.userId]}
              </span>
            ) : (
              userIdHelp ?? (
                <span className="text-gray-500">
                  小文字英字と _ のみ／1〜32文字
                </span>
              )
            )}
          </HintRow>
        </label>

        {/* PASSWORD */}
        <label className="block">
          <span className="mb-1 block text-sm text-gray-700">・PASSWORD</span>
          <PasswordInput
            value={values.password}
            onValueChange={setters.setPassword}
            onBlur={touch.password}
            placeholder="PASSWORD"
          />
          <HintRow>
            {touched.password && fieldErrors.password ? (
              <span className="text-red-600">
                {errorMessagesJA[fieldErrors.password]}
              </span>
            ) : !touched.password ? (
              <span className="text-gray-500">
                半角の英数字・記号のみ（スペース不可）で入力してください
              </span>
            ) : (
              <span className="invisible">placeholder</span>
            )}
          </HintRow>
        </label>

        {/* CONFIRM */}
        <label className="block">
          <PasswordInput
            value={values.confirmPassword}
            onValueChange={setters.setConfirmPassword}
            onBlur={touch.confirmPassword}
            placeholder="PASSWORD（確認）"
          />
          <HintRow>
            {touched.confirmPassword && fieldErrors.confirmPassword ? (
              <span className="text-red-600">
                {errorMessagesJA[fieldErrors.confirmPassword]}
              </span>
            ) : !touched.confirmPassword ? (
              <span className="text-gray-500">
                確認のため再入力してください。
              </span>
            ) : (
              <span className="invisible">placeholder</span>
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
            <span className="text-gray-500">
              入力は任意です。アプリ内で再設定できます。
            </span>
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
            <span className="text-gray-500">
              入力は任意です。アプリ内で再設定できます。
            </span>
          </HintRow>
        </label>
      </div>

      {/* Actions（2カラム／各カラム中央） */}
      <div className="mt-6 grid grid-cols-2 gap-3 justify-items-center">
        <Button variant="secondary" onClick={onCancel}>
          キャンセル
        </Button>
        <Button onClick={onSubmit} disabled={!canSubmit}>
          確認へ
        </Button>
      </div>
    </>
  );
}
