"use client";

import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import PasswordInput from "@/components/common/PasswordInput";
import { errorMessagesJA } from "@/ui/i18n/errorMessages";

export type TeamRegisterValues = {
  teamId: string;
  password: string;
  confirmPassword: string;
  contact: string;
  teamName: string;
};

export type TeamRegisterSetters = {
  setTeamId: (v: string) => void;
  setPassword: (v: string) => void;
  setConfirmPassword: (v: string) => void;
  setContact: (v: string) => void;
  setTeamName: (v: string) => void;
};

export type TeamRegisterFieldErrors = Partial<{
  teamId: "REQUIRED" | "USER_ID_FORMAT";
  password: "REQUIRED" | "PASSWORD_LENGTH" | "PASSWORD_CHARSET";
  confirmPassword: "REQUIRED" | "CONFIRM_MISMATCH";
}>;

export type TeamRegisterAvailability =
  | "unknown"
  | "available"
  | "taken"
  | "error";
export type TeamRegisterTouched = {
  teamId: boolean;
  password: boolean;
  confirmPassword: boolean;
};
export type TeamRegisterTouch = {
  teamId: () => void;
  password: () => void;
  confirmPassword: () => void;
};

export interface TeamRegisterFormCardProps {
  values: TeamRegisterValues;
  setters: TeamRegisterSetters;
  fieldErrors: TeamRegisterFieldErrors;
  availability: TeamRegisterAvailability;
  checking: boolean;
  canSubmit: boolean;
  onCancel: () => void;
  onSubmit: () => void;
  touched: TeamRegisterTouched;
  touch: TeamRegisterTouch;
}

export default function TeamRegisterFormCard({
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
}: TeamRegisterFormCardProps) {
  const idHelp = (() => {
    if (checking) return <span className="text-gray-500">確認中…</span>;
    if (availability === "available")
      return <span className="text-green-600">使用可能です</span>;
    if (availability === "taken")
      return <span className="text-red-600">使用できません</span>;
    return null; // unknown/error は表示しない
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

  return (
    <>
      <h2 className="text-lg font-semibold text-gray-900 text-center">
        チーム作成
      </h2>

      <div className="mt-4 space-y-4">
        {/* TEAM_ID */}
        <label className="block">
          <span className="mb-1 block text-sm text-gray-700">・TEAM_ID</span>
          <Input
            value={values.teamId}
            onValueChange={setters.setTeamId}
            onBlur={touch.teamId}
            placeholder="TEAM_ID"
          />
          <HintRow>
            {touched.teamId && fieldErrors.teamId ? (
              <span className="text-red-600">
                {errorMessagesJA[fieldErrors.teamId]}
              </span>
            ) : (
              idHelp ?? (
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

        {/* TEAM_NAME（任意） */}
        <label className="block">
          <span className="mb-1 block text-sm text-gray-700">・TEAM_NAME</span>
          <Input
            value={values.teamName}
            onValueChange={setters.setTeamName}
            placeholder="TEAM_NAME"
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
