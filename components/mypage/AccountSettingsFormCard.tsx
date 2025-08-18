"use client";

import { useEffect, useMemo } from "react";
import Input from "@/components/common/Input";
import PasswordInput from "@/components/common/PasswordInput";
import FieldHint from "@/components/common/FieldHint";
import ActionsRow from "@/components/common/ActionsRow";
import { useAccountSettingsForm } from "@/hooks/useAccountSettingsForm";
import useFormNavWithActions from "@/hooks/useFormNavWithActions";

export type AccountSettingsInitial = {
  login_id: string;
  user_name: string;
  contact: string;
};

export type AccountSettingsDiff = Partial<{
  login_id: string;
  user_name: string;
  contact: string;
  password: string;
}>;

export type AccountSettingsFormState = {
  values: AccountSettingsInitial & {
    password: string;
    confirmPassword: string;
  };
  diff: AccountSettingsDiff;
  hasBlockingError: boolean;
  hasChanges: boolean;
  canSave: boolean;
};

type Props = {
  initial: AccountSettingsInitial;
  onStateChange?: (state: AccountSettingsFormState) => void;
  onCancel: () => void;
  onSubmit: () => void;
  submitting?: boolean;
};

export default function AccountSettingsFormCard({
  initial,
  onStateChange,
  onCancel,
  onSubmit,
  submitting = false,
}: Props) {
  const {
    values,
    setValues,
    availability,
    checking,
    passwordError,
    loginIdError,
    hasBlockingError,
    hasChanges,
    diff,
  } = useAccountSettingsForm(initial);

  // ↑/↓ロービング + ActionsRow からの引き込みをフックで共通化
  const { getRootProps, actionRowRef } = useFormNavWithActions();

  // 親へスナップショット通知
  useEffect(() => {
    onStateChange?.({
      values,
      diff,
      hasBlockingError,
      hasChanges,
      canSave: hasChanges && !hasBlockingError && !checking && !submitting,
    });
  }, [
    values,
    diff,
    hasBlockingError,
    hasChanges,
    checking,
    submitting,
    onStateChange,
  ]);

  // ヒント
  const loginIdHint = useMemo(() => {
    if (values.login_id.trim() === "")
      return { msg: "入力してください", state: "neutral" as const };
    if (checking) return { msg: "確認中…", state: "neutral" as const };
    if (loginIdError) return { msg: loginIdError, state: "error" as const };
    if (availability === "ok")
      return { msg: "使用可能です", state: "ok" as const };
    if (availability === "ng")
      return { msg: "このUSER_IDは使用できません", state: "error" as const };
    return { msg: undefined, state: "neutral" as const };
  }, [values.login_id, checking, loginIdError, availability]);

  const passwordHint = useMemo(() => {
    if (!values.password && !values.confirmPassword)
      return { msg: "未入力なら変更されません", state: "neutral" as const };
    if (passwordError) return { msg: passwordError, state: "error" as const };
    return { msg: "OK", state: "ok" as const };
  }, [values.password, values.confirmPassword, passwordError]);

  return (
    <div {...getRootProps()} className="grid gap-4">
      {/* USER_ID */}
      <div>
        <Input
          label="USER_ID（英数と _ ）"
          placeholder="your_id"
          value={values.login_id}
          onChange={(e) =>
            setValues((v) => ({ ...v, login_id: e.target.value }))
          }
          autoComplete="username"
        />
        <FieldHint message={loginIdHint.msg} state={loginIdHint.state} />
      </div>

      {/* PASSWORD（任意） */}
      <div>
        <PasswordInput
          label="新しいパスワード（任意）"
          placeholder="••••••••"
          value={values.password}
          onChange={(e) =>
            setValues((v) => ({ ...v, password: e.target.value }))
          }
          autoComplete="new-password"
        />
        <PasswordInput
          className="mt-2"
          label="確認用（任意）"
          placeholder="••••••••"
          value={values.confirmPassword}
          onChange={(e) =>
            setValues((v) => ({ ...v, confirmPassword: e.target.value }))
          }
          autoComplete="new-password"
        />
        <FieldHint message={passwordHint.msg} state={passwordHint.state} />
      </div>

      {/* USER_NAME（任意） */}
      <div>
        <Input
          label="ユーザー名（任意）"
          placeholder="山田 太郎"
          value={values.user_name}
          onChange={(e) =>
            setValues((v) => ({ ...v, user_name: e.target.value }))
          }
          autoComplete="name"
        />
      </div>

      {/* CONTACT（任意） */}
      <div>
        <Input
          label="連絡先（任意）"
          placeholder="example@example.com / 090-xxxx-xxxx"
          value={values.contact}
          onChange={(e) =>
            setValues((v) => ({ ...v, contact: e.target.value }))
          }
          autoComplete="email"
        />
      </div>

      {/* ボタン群（フォーム内に配置） */}
      <div ref={actionRowRef} className="mt-4">
        <ActionsRow
          cancelLabel="キャンセル"
          confirmLabel="保存"
          onCancel={onCancel}
          onConfirm={onSubmit}
          align="between"
          size="md"
          confirmVariant="primary"
          confirmDisabled={
            !(hasChanges && !hasBlockingError && !checking && !submitting)
          }
          cancelDoesNotClose
        />
      </div>
    </div>
  );
}
