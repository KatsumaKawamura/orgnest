// components/auth/RegisterFormCard.tsx
"use client";
import { Ref } from "react";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import FieldHint from "@/components/common/FieldHint";
import useArrowFormNav from "@/hooks/useArrowFormNav";
import PasswordInput from "@/components/common/PasswordInput";

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
  // 互換性のために複数の形を許可（旧: boolean/null, 新: オブジェクト）
  availability: { userId?: "unknown" | "available" | "taken" } | boolean | null;
  checking: { userId: boolean } | boolean;
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

  // React.Ref<HTMLDivElement> なので MutableRefObject / Callback 両対応
  actionRowRef: Ref<HTMLDivElement>;
  onRootKeyDown: (e: React.KeyboardEvent | KeyboardEvent) => void;
};

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

  // ↑/↓：常に奪って移動・外から↑=最上/↓=最下・フォーカス時は末尾にキャレット
  const { formRef, onKeyDown: onFormKeyDown } = useArrowFormNav({
    loop: true,
    pullIn: true,
    caretOnFocus: "end",
  });

  // 旧API互換: availability を統一表現に正規化
  let availabilityStatus: "unknown" | "available" | "taken" | undefined;
  if (availability === true) availabilityStatus = "available";
  else if (availability === false) availabilityStatus = "taken";
  else if (availability && typeof availability === "object")
    availabilityStatus = availability.userId;
  else availabilityStatus = "unknown";

  // 旧API互換: checking を boolean に正規化
  const isChecking =
    typeof checking === "object" ? !!checking.userId : !!checking;

  return (
    <div
      ref={formRef}
      className="bg-white text-gray-800 p-6 rounded shadow-lg w-[min(92vw,420px)]"
      onKeyDown={(e) => {
        // ↑/↓ を先に、←/→（roving）を後に
        onFormKeyDown(e);
        onRootKeyDown(e);
      }}
    >
      <h2 className="text-lg font-semibold mb-4" data-modal-title>
        アカウント作成
      </h2>

      {/* USER_ID */}
      <label className="text-gray-800 block text-sm mb-1">・USER_ID</label>
      <Input
        type="text"
        placeholder="USER_ID（ログインに使用）"
        value={userId}
        onChange={(e) => onChange.setUserId(e.target.value)}
        className="mb-1"
        disabled={submitting}
        aria-invalid={!!errors.userId}
      />
      <FieldHint
        message={
          isChecking
            ? "ユーザーIDを確認中…"
            : errors.userId ||
              (availabilityStatus === "taken"
                ? "このUSER_IDは使用できません"
                : undefined)
        }
        state={
          isChecking
            ? "waiting"
            : errors.userId
            ? "neutral"
            : availabilityStatus === "available"
            ? "ok"
            : "neutral"
        }
      />

      {/* PASSWORD（← ここを PasswordInput に） */}
      <label className="text-gray-800 block text-sm mb-1">・PASSWORD</label>
      <PasswordInput
        placeholder="PASSWORD"
        value={password}
        onChange={(e) => onChange.setPassword(e.target.value)}
        className="mb-1"
        disabled={submitting}
        aria-invalid={!!errors.password}
        autoComplete="new-password"
      />
      <FieldHint
        message={errors.password}
        state={errors.password ? "neutral" : "neutral"}
      />

      {/* CONFIRM PASSWORD（← ここも PasswordInput に） */}
      <PasswordInput
        placeholder="PASSWORD（確認）"
        value={confirmPassword}
        onChange={(e) => onChange.setConfirmPassword(e.target.value)}
        className="mb-1"
        disabled={submitting}
        aria-invalid={!!errors.confirmPassword}
        autoComplete="new-password"
      />
      <FieldHint
        message={errors.confirmPassword}
        state={errors.confirmPassword ? "neutral" : "neutral"}
      />

      {/* CONTACT */}
      <label className="text-gray-800 block text-sm mb-1">・CONTACT</label>
      <Input
        type="text"
        placeholder="E-MAIL（PASS再設定用）"
        value={contact}
        onChange={(e) => onChange.setContact(e.target.value)}
        className="mb-1"
        disabled={submitting}
      />
      <FieldHint
        message={errors.contact ?? "任意入力です。ログイン後に再設定できます。"}
        state={errors.contact ? "neutral" : "neutral"}
      />

      {/* USER_NAME */}
      <label className="text-gray-800 block text-sm mb-1">・USER_NAME</label>
      <Input
        type="text"
        placeholder="USER_NAME（アプリ内での表示名）"
        value={userName}
        onChange={(e) => onChange.setUserName(e.target.value)}
        className="mb-1"
        disabled={submitting}
        aria-invalid={!!errors.userName}
      />
      <FieldHint
        message={
          errors.userName ?? "任意入力です。ログイン後に再設定できます。"
        }
        state={errors.userName ? "neutral" : "neutral"}
      />

      <div
        ref={actionRowRef}
        role="group"
        aria-orientation="horizontal"
        className="flex justify-between"
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
