"use client";

import { Ref, PropsWithChildren } from "react";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import FieldHint from "@/components/common/FieldHint";
import PasswordInput from "@/components/common/PasswordInput";
import useFormNavWithActions from "@/hooks/useFormNavWithActions";
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

  /** 互換維持のため受け取るが、内部フックで完結するため必須ではない */
  actionRowRef?: Ref<HTMLDivElement>;
  /** ←/→ 等の親側ロジックがあれば併用できるよう受け取る */
  onRootKeyDown?: (e: React.KeyboardEvent | KeyboardEvent) => void;
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

/**
 * ヒント行の高さを常に確保するため、FieldHint を min-height 付きの
 * コンテナでラップ。未表示時は不可視プレースホルダーで1行分を保持。
 * - 想定文字サイズ: text-xs（約1.25rem行高）
 * - 実ヒントが2行以上なら自動で高さ拡張
 */
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
      <div
        className="mt-1 min-h-[1.25rem]"
        aria-live="polite"
        aria-atomic="true"
      >
        {hintMessage ? (
          <FieldHint message={hintMessage} state={hintState} />
        ) : (
          /* text-xs と同じ行高を不可視で確保 */
          <span className="invisible block text-xs">&nbsp;</span>
        )}
      </div>
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
  actionRowRef: externalActionRowRef,
  onRootKeyDown,
}: Props) {
  const { userId, password, confirmPassword, contact, userName } = values;

  // 共通フック：↑/↓ロービング + ActionsRow 引き込み
  const { getRootProps, actionRowRef, onKeyDown } = useFormNavWithActions();

  // 互換：外から actionRowRef をもらっていればマージ（片方しか来ない前提でもOK）
  const mergeActionRowRef = (node: HTMLDivElement | null) => {
    // 内部
    // @ts-ignore
    actionRowRef.current = node;
    // 外部（コールバック or RefObject 両対応）
    if (typeof externalActionRowRef === "function") {
      externalActionRowRef(node);
    } else if (
      externalActionRowRef &&
      "current" in (externalActionRowRef as any)
    ) {
      (externalActionRowRef as any).current = node;
    }
  };

  const availabilityStatus = availability.userId ?? "unknown";
  const isChecking = !!checking.userId;

  const userIdHintMsg = isChecking
    ? "ユーザーIDを確認中…"
    : errors.userId ??
      (availabilityStatus === "taken"
        ? "このUSER_IDは使用できません"
        : availabilityStatus === "available"
        ? "使用可能です"
        : undefined);

  const userIdHintState = isChecking
    ? "neutral"
    : errors.userId
    ? stateFromError(errors.userId)
    : availabilityStatus === "available"
    ? "ok"
    : availabilityStatus === "taken"
    ? "error"
    : "neutral";

  // getRootProps から受けた onKeyDown に、親からの onRootKeyDown を“後段”で併用
  const { ref: rootRef, onKeyDown: rootOnKeyDown } = getRootProps();

  return (
    <div
      ref={rootRef}
      className="bg-white text-gray-800 p-6 rounded shadow-lg w-[min(92vw,420px)]"
      onKeyDown={(e) => {
        rootOnKeyDown(e);
        onRootKeyDown?.(e);
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
        label=""
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

      {/* ボタン群 */}
      <div
        ref={mergeActionRowRef}
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
