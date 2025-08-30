// @/components/common/modal/Dialog.tsx
"use client";

import BaseModal from "@/components/common/modal/BaseModal";
import Button from "@/components/common/Button";
import { ReactNode } from "react";

type Variant = "confirm" | "info";
type Tone = "default" | "danger"; // confirm専用

export type DialogProps = {
  open: boolean;
  onClose: () => void;

  variant: Variant;

  // 共通
  title?: ReactNode;
  message?: ReactNode;

  // Confirm 用
  tone?: Tone;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;

  // Info 用
  infoLabel?: string;
  onInfo?: () => void;

  className?: string;
};

export default function Dialog({
  open,
  onClose,
  variant,
  title = variant === "confirm" ? "確認" : "お知らせ",
  message = variant === "confirm" ? "よろしいですか？" : undefined,

  // confirm
  tone = "default",
  confirmLabel = "OK",
  cancelLabel = "キャンセル",
  onConfirm,

  // info
  infoLabel = "OK",
  onInfo,

  className,
}: DialogProps) {
  return (
    <BaseModal
      open={open}
      onClose={onClose}
      backdropProps={{
        className:
          "z-[1000] bm-overlay flex items-center justify-center bg-black/50",
      }}
      containerProps={{
        className: [
          "bm-container bg-white rounded-2xl shadow-xl w-[min(92vw,420px)] p-6",
          "animate-in fade-in zoom-in-95 duration-200",
          className,
        ]
          .filter(Boolean)
          .join(" "),
      }}
    >
      {/* Header */}
      <h2 className="text-lg font-semibold mb-3 text-center text-gray-800">
        {title}
      </h2>

      {/* Body */}
      {message && (
        <div className="text-sm leading-6 text-center mb-6 text-gray-800 whitespace-pre-line">
          {Array.isArray(message) ? (
            <ul className="list-disc pl-5 space-y-1 text-left inline-block text-gray-800">
              {message.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-800 whitespace-pre-line">{message}</p>
          )}
        </div>
      )}

      {/* Actions */}
      {variant === "confirm" && (
        <div className="grid grid-cols-2 gap-3 justify-items-center">
          <Button
            variant="secondary"
            onClick={onClose}
            className="w-32 justify-self-center"
          >
            {cancelLabel}
          </Button>
          <Button
            variant={tone === "danger" ? "danger" : "primary"}
            onClick={() => {
              onConfirm?.();
            }}
            className="w-32 justify-self-center"
          >
            {confirmLabel}
          </Button>
        </div>
      )}

      {variant === "info" && (
        <div className="flex justify-center">
          <Button
            variant="primary"
            onClick={() => {
              onInfo?.();
              onClose();
            }}
            className="w-32"
          >
            {infoLabel}
          </Button>
        </div>
      )}
    </BaseModal>
  );
}
