// @/components/auth/RegisterReviewDialog.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Button from "@/components/common/Button";
import useModalActionRoving from "@/hooks/useModalActionRoving";

type Values = {
  userId: string;
  password: string;
  contact?: string;
  userName?: string;
};

type Labels = Partial<Record<keyof Values, string>>;

type Props = {
  title?: string;
  values: Values;
  labels?: Labels;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  /** 初期は伏字にする（既定 true） */
  maskPassword?: boolean;
  /** 見た目オーバーライド */
  className?: string;
  panelClassName?: string;
  /** ラベル列の幅（例 "8rem"） */
  labelWidth?: string;
  /** 下線エリアの幅（例 "20rem"） */
  fieldWidth?: string;
};

export default function RegisterReviewDialog({
  title = "入力内容の確認",
  values,
  labels,
  confirmLabel = "登録する",
  cancelLabel = "戻る",
  onConfirm,
  onCancel,
  maskPassword = true,
  className,
  panelClassName,
  labelWidth = "8rem",
  fieldWidth = "20rem",
}: Props) {
  const actionRowRef = useRef<HTMLDivElement | null>(null);
  const [showPassword, setShowPassword] = useState(!maskPassword);

  const roving = useModalActionRoving({
    loop: true,
    overrideInput: true,
  });

  useEffect(() => {
    const enter =
      actionRowRef.current?.querySelector<HTMLElement>("[data-enter]");
    enter?.focus();
  }, []);

  const L = useMemo<Required<Labels>>(
    () => ({
      userId: labels?.userId ?? "USER_ID",
      password: labels?.password ?? "PASSWORD",
      contact: labels?.contact ?? "CONTACT",
      userName: labels?.userName ?? "USER_NAME",
    }),
    [labels]
  );

  const renderValue = (val?: string) => (val?.trim()?.length ? val : "None");

  const maskedPassword =
    values.password && values.password.length > 0
      ? "•".repeat(values.password.length)
      : "None";

  return (
    <div
      className={[
        "w-[min(92vw,560px)] rounded-xl bg-white shadow-lg text-gray-800 p-6",
        "mx-auto",
        panelClassName,
      ]
        .filter(Boolean)
        .join(" ")}
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-title"
    >
      {/* 見出し */}
      <h2 id="review-title" className="text-lg font-semibold mb-6 text-center">
        {title}
      </h2>

      {/* 各行 */}
      <div className="space-y-4">
        {/* USER_ID */}
        <div className="flex items-center justify-center gap-4">
          <div
            className="shrink-0 text-sm text-gray-600 text-left"
            style={{ width: labelWidth }}
          >
            {L.userId}
          </div>
          <div
            className="relative text-left px-2 border-b border-gray-400"
            style={{ width: fieldWidth }}
            aria-label={L.userId}
          >
            <span className="block py-1 break-all">
              {renderValue(values.userId)}
            </span>
          </div>
        </div>

        {/* PASSWORD */}
        <div className="flex items-center justify-center gap-4">
          <div
            className="shrink-0 text-sm text-gray-600 text-left"
            style={{ width: labelWidth }}
          >
            {L.password}
          </div>
          <div
            className="relative text-left px-2 border-b border-gray-400"
            style={{ width: fieldWidth }}
            aria-label={L.password}
          >
            <span className="block py-1 pr-6 break-all">
              {showPassword ? renderValue(values.password) : maskedPassword}
            </span>
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-pressed={showPassword}
              aria-label={
                showPassword ? "パスワードを非表示" : "パスワードを表示"
              }
              className="absolute right-1 top-1/2 -translate-y-1/2 inline-flex items-center justify-center p-1 rounded hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Eye className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* CONTACT */}
        <div className="flex items-center justify-center gap-4">
          <div
            className="shrink-0 text-sm text-gray-600 text-left"
            style={{ width: labelWidth }}
          >
            {L.contact}
          </div>
          <div
            className="relative text-left px-2 border-b border-gray-400"
            style={{ width: fieldWidth }}
            aria-label={L.contact}
          >
            <span className="block py-1 break-all">
              {renderValue(values.contact)}
            </span>
          </div>
        </div>

        {/* USER_NAME */}
        <div className="flex items-center justify-center gap-4">
          <div
            className="shrink-0 text-sm text-gray-600 text-left"
            style={{ width: labelWidth }}
          >
            {L.userName}
          </div>
          <div
            className="relative text-left px-2 border-b border-gray-400"
            style={{ width: fieldWidth }}
            aria-label={L.userName}
          >
            <span className="block py-1 break-all">
              {renderValue(values.userName)}
            </span>
          </div>
        </div>
      </div>

      {/* ボタン群 */}
      <div
        ref={(node) => {
          actionRowRef.current = node;
          // @ts-ignore
          roving.rowRef.current = node;
        }}
        role="group"
        aria-orientation="horizontal"
        className="mt-6 flex justify-center gap-3"
      >
        <Button
          variant="secondary"
          size="md"
          onClick={onCancel}
          data-action="cancel"
          data-enter-ignore
          type="button"
        >
          {cancelLabel}
        </Button>
        <Button
          variant="primary"
          size="md"
          onClick={onConfirm}
          data-action="primary"
          data-enter
          type="button"
        >
          {confirmLabel}
        </Button>
      </div>
    </div>
  );
}
