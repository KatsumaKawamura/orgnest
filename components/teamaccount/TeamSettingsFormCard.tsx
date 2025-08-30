// @/components/teamaccount/TeamSettingsFormCard.tsx
"use client";

import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import PasswordInput from "@/components/common/PasswordInput";
import type { UseTeamAuthFormReturn } from "@/hooks/forms/useTeamAuthForm";
import { errorMessagesJA } from "@/ui/i18n/errorMessages";

type Values = UseTeamAuthFormReturn["values"];
type Setters = UseTeamAuthFormReturn["setters"];
type FieldErrors = UseTeamAuthFormReturn["fieldErrors"];
type Availability = UseTeamAuthFormReturn["availability"];

export interface TeamSettingsFormCardProps {
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

export default function TeamSettingsFormCard({
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
}: TeamSettingsFormCardProps) {
  const teamIdHelp = (() => {
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

  // ※ 外枠（bg-white / shadow / padding）は SettingsModal 側で付与（無印準拠）
  return (
    <>
      <h2 className="text-lg font-semibold text-gray-900 text-center">
        チーム情報の変更
      </h2>

      <div className="mt-5 space-y-4">
        {/* TEAM_ID */}
        <label className="block">
          <span className="mb-1 block text-sm text-gray-700">・TEAM_ID</span>
          <Input
            value={values.teamId}
            onValueChange={setters.setTeamId}
            placeholder="TEAM_ID"
          />
          <HintRow>
            {fieldErrors.teamId ? (
              <span className="text-red-600">
                {errorMessagesJA[fieldErrors.teamId]}
              </span>
            ) : (
              teamIdHelp
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

        {/* TEAM_NAME（任意） */}
        <label className="block">
          <span className="mb-1 block text-sm text-gray-700">・TEAM_NAME</span>
          <Input
            value={values.teamName}
            onValueChange={setters.setTeamName}
            placeholder="TEAM_NAME"
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

      {/* Actions：Register と同じ 2 カラム中央寄せ（無印準拠） */}
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
