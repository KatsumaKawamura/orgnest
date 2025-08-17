"use client";
import { Ref, PropsWithChildren } from "react";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import FieldHint from "@/components/common/FieldHint";
import useArrowFormNav from "@/hooks/useArrowFormNav";
import PasswordInput from "@/components/common/PasswordInput";
import type { Availability, Checking } from "@/types/register";

type Props = {
  values: {
    userId: string;
    password: string;
    confirmPassword: string;
    contact: string;
    userName: string;
  };
  errors: {
    userId?: string;
    password?: string;
    confirmPassword?: string;
    contact?: string;
    userName?: string;
  };
  availability: Availability; // { userId?: "unknown" | "available" | "taken" }
  checking: Checking; // { userId: boolean }
  submitting: boolean;
  onChange: {
    setUserId: (v: string) => void;
    setPassword: (v: string) => void;
    setConfirmPassword: (v: string) => void;
    setContact: (v: string) => void;
    setUserName: (v: string) => void;
  };
  onCancel: () => void;
  onSubmit: () => void;
  submitDisabled: boolean;

  actionRowRef: Ref<HTMLDivElement>;
  onRootKeyDown: (e: React.KeyboardEvent | KeyboardEvent) => void;
};

/** 「入力してください」を赤にしない（句点/末尾空白を無視） */
const isPlainInputRequest = (msg?: string) => {
  if (!msg) return false;
  const normalized = msg.trim().replace(/[。\.]\s*$/, "");
  return normalized === "入力してください";
};
/** 共通：通常エラーメッセージ→赤/「入力してください」→neutral */
const stateFromError = (msg?: string) =>
  msg ? (isPlainInputRequest(msg) ? "neutral" : "error") : "neutral";

/** ラベル + 入力 + ヒント をまとめる薄いラッパー */
function FormRow({
  label,
  hintMessage,
  hintState = "neutral",
  className,
  children,
}: PropsWithChildren<{
  label: string;
  hintMessage?: string;
  hintState?: "neutral" | "ok" | "waiting" | "error";
  className?: string;
}>) {
  return (
    <div className={className}>
      <label className="text-gray-800 block text-sm mb-1">{label}</label>
      {children}
      <FieldHint message={hintMessage} state={hintState} />
    </div>
  );
}

export default function RegisterFormCard({
  values,
  errors,
  availability,
  checking,
  submitting,
  onChange,
  onCancel,
  onSubmit,
  submitDisabled,
  actionRowRef,
  onRootKeyDown,
}: Props) {
  const { userId, password, confirmPassword, contact, userName } = values;

  const { formRef, onKeyDown: onFormKeyDown } = useArrowFormNav({
    loop: true,
    pullIn: true,
    caretOnFocus: "end",
  });

  const availabilityStatus = availability.userId ?? "unknown";
  const isChecking = !!checking.userId;

  // USER_ID のヒント（メッセージ & 色）
  const userIdHintMsg = isChecking
    ? "ユーザーIDを確認中…"
    : errors.userId ??
      (availabilityStatus === "taken"
        ? "このUSER_IDは使用できません"
        : availabilityStatus === "available"
        ? "使用可能です"
        : undefined);

  const userIdHintState = isChecking
    ? "neutral" // 確認中は neutral（灰）
    : errors.userId
    ? stateFromError(errors.userId) // 入力してください=neutral/その他=赤
    : availabilityStatus === "available"
    ? "ok" // 緑
    : availabilityStatus === "taken"
    ? "error" // 赤
    : "neutral";

  return (
    <div
      ref={formRef}
      className="bg-white text-gray-800 p-6 rounded shadow-lg w-[min(92vw,420px)]"
      onKeyDown={(e) => {
        onFormKeyDown(e); // ↑/↓
        onRootKeyDown(e); // ←/→
      }}
    >
      <h2 className="text-lg font-semibold mb-4" data-modal-title>
        アカウント作成
      </h2>

      {/* USER_ID */}
      <FormRow
        label="・USER_ID"
        hintMessage={userIdHintMsg}
        hintState={userIdHintState}
      >
        <Input
          type="text"
          placeholder="USER_ID（ログインに使用）"
          value={userId}
          onChange={(e) => onChange.setUserId(e.target.value)}
          className="mb-1"
          disabled={submitting}
          aria-invalid={!!errors.userId}
        />
      </FormRow>

      {/* PASSWORD */}
      <FormRow
        className="mt-4"
        label="・PASSWORD"
        hintMessage={errors.password}
        hintState={stateFromError(errors.password)}
      >
        <PasswordInput
          placeholder="PASSWORD"
          value={password}
          onChange={(e) => onChange.setPassword(e.target.value)}
          className="mb-1"
          disabled={submitting}
          aria-invalid={!!errors.password}
          autoComplete="new-password"
        />
      </FormRow>

      {/* CONFIRM PASSWORD */}
      <FormRow
        label="・PASSWORD（確認）"
        hintMessage={errors.confirmPassword}
        hintState={stateFromError(errors.confirmPassword)}
      >
        <PasswordInput
          placeholder="PASSWORD（確認）"
          value={confirmPassword}
          onChange={(e) => onChange.setConfirmPassword(e.target.value)}
          className="mb-1"
          disabled={submitting}
          aria-invalid={!!errors.confirmPassword}
          autoComplete="new-password"
        />
      </FormRow>

      {/* CONTACT */}
      <FormRow
        className="mt-4"
        label="・CONTACT"
        hintMessage={
          errors.contact ?? "任意入力です。ログイン後に再設定できます。"
        }
        hintState={stateFromError(errors.contact)}
      >
        <Input
          type="text"
          placeholder="E-MAIL（PASS再設定用）"
          value={contact}
          onChange={(e) => onChange.setContact(e.target.value)}
          className="mb-1"
          disabled={submitting}
        />
      </FormRow>

      {/* USER_NAME */}
      <FormRow
        className="mt-4"
        label="・USER_NAME"
        hintMessage={
          errors.userName ?? "任意入力です。ログイン後に再設定できます。"
        }
        hintState={stateFromError(errors.userName)}
      >
        <Input
          type="text"
          placeholder="USER_NAME（アプリ内での表示名）"
          value={userName}
          onChange={(e) => onChange.setUserName(e.target.value)}
          className="mb-1"
          disabled={submitting}
          aria-invalid={!!errors.userName}
        />
      </FormRow>

      {/* ボタン群（上マージンあり） */}
      <div
        ref={actionRowRef}
        role="group"
        aria-orientation="horizontal"
        className="mt-4 flex justify-between"
      >
        <Button
          variant="secondary"
          size="md"
          onClick={onCancel}
          disabled={submitting}
          type="button"
          data-enter-ignore
          data-action="cancel"
        >
          キャンセル
        </Button>

        <Button
          variant="primary"
          size="md"
          onClick={onSubmit}
          disabled={submitDisabled}
          aria-disabled={submitDisabled}
          data-enter
          data-action="primary"
        >
          登録
        </Button>
      </div>
    </div>
  );
}
