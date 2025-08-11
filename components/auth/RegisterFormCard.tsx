// components/auth/RegisterFormCard.tsx
"use client";
import { Ref } from "react";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import FieldHint from "@/components/common/FieldHint";
import useArrowFormNav from "@/hooks/useArrowFormNav"; // ← 追加

type Props = {
  values: {
    userId: string;
    password: string;
    confirmPassword: string;
    contact: string;
    userName: string;
  };
  errors: { userId?: string; password?: string; confirmPassword?: string };
  availability: null | boolean;
  checking: boolean;
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

  return (
    <div
      ref={formRef} // ← 追加：↑/↓ の探索範囲（フォーム全体）
      className="bg-white p-6 rounded shadow-lg w-80 text-gray-800"
      role="dialog"
      aria-modal="true"
      // ← キー合成：↑/↓ を先に、←/→（roving）を後に
      onKeyDown={(e) => {
        onFormKeyDown(e);
        onRootKeyDown(e);
      }}
    >
      <h2 className="text-lg font-semibold mb-4">アカウント作成</h2>

      {/* USER_ID */}
      <Input
        type="text"
        placeholder="USER_ID"
        value={userId}
        onChange={(e) => onChange.setUserId(e.target.value)}
        className="mb-1"
        disabled={submitting}
        aria-invalid={!!errors.userId}
      />
      <FieldHint
        message={
          errors.userId
            ? errors.userId
            : availability === true
            ? "使用可能です"
            : availability === false
            ? "使用できません"
            : checking
            ? "確認中…"
            : undefined
        }
        state={
          errors.userId
            ? errors.userId === "入力してください"
              ? "neutral"
              : "error"
            : availability === true
            ? "ok"
            : availability === false
            ? "error"
            : "waiting"
        }
      />

      {/* PASSWORD */}
      <Input
        type="password"
        placeholder="PASSWORD"
        value={password}
        onChange={(e) => onChange.setPassword(e.target.value)}
        className="mb-1"
        disabled={submitting}
        aria-invalid={!!errors.password}
      />
      <FieldHint
        message={errors.password}
        state={errors.password ? "neutral" : "neutral"}
      />

      {/* PASSWORD（確認） */}
      <Input
        type="password"
        placeholder="PASSWORD（確認用）"
        value={confirmPassword}
        onChange={(e) => onChange.setConfirmPassword(e.target.value)}
        className="mb-1"
        disabled={submitting}
        aria-invalid={!!errors.confirmPassword}
      />
      <FieldHint
        message={errors.confirmPassword}
        state={
          errors.confirmPassword
            ? errors.confirmPassword === "入力してください"
              ? "neutral"
              : "error"
            : "neutral"
        }
      />

      {/* 連絡先 / ユーザー名（任意） */}
      <div className="mb-3">
        <Input
          type="email"
          placeholder="E-MAIL（任意）"
          value={contact}
          onChange={(e) => onChange.setContact(e.target.value)}
          disabled={submitting}
        />
        <p className="text-xs text-gray-800 mt-1">
          E-MAILは後から再設定可能です。
        </p>
      </div>

      <div className="mb-4">
        <Input
          type="text"
          placeholder="USER_NAME（任意）"
          value={userName}
          onChange={(e) => onChange.setUserName(e.target.value)}
          disabled={submitting}
        />
        <p className="text-xs text-gray-800 mt-1">
          USER_NAMEは後から再設定可能です。
        </p>
      </div>

      {/* アクション行：左右 roving 対象 */}
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
          data-enter-ignore
          data-action="cancel" // 左：キャンセル
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
          data-action="primary" // 右：登録（無効は hook が自動スキップ）
        >
          登録
        </Button>
      </div>
    </div>
  );
}
