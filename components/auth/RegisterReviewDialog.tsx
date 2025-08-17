"use client";

import { useMemo } from "react";
import { useFadeModal } from "@/components/common/FadeModalWrapper";
import ReviewFieldRow from "@/components/auth/ReviewFieldRow";
import ActionsRow from "@/components/common/ActionsRow";

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
  maskPassword?: boolean;
  className?: string;
  panelClassName?: string;
  labelWidth?: string;
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
  // ここでは close() を直接呼ばない（閉じるのは ActionsRow の責務）
  useFadeModal();

  const L = useMemo(
    () => ({
      userId: labels?.userId ?? "USER_ID",
      password: labels?.password ?? "PASSWORD",
      contact: labels?.contact ?? "CONTACT",
      userName: labels?.userName ?? "USER_NAME",
    }),
    [labels]
  );

  return (
    <div
      className={[
        "w-[min(92vw,560px)] rounded-xl bg-white shadow-lg text-gray-800 p-6",
        "mx-auto",
        panelClassName,
        className,
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
        <ReviewFieldRow
          label={L.userId}
          value={values.userId}
          labelWidth={labelWidth}
          fieldWidth={fieldWidth}
          ariaLabel={L.userId}
        />
        <ReviewFieldRow
          label={L.password}
          value={values.password}
          maskable
          defaultMasked={maskPassword}
          labelWidth={labelWidth}
          fieldWidth={fieldWidth}
          ariaLabel={L.password}
        />
        <ReviewFieldRow
          label={L.contact}
          value={values.contact}
          labelWidth={labelWidth}
          fieldWidth={fieldWidth}
          ariaLabel={L.contact}
        />
        <ReviewFieldRow
          label={L.userName}
          value={values.userName}
          labelWidth={labelWidth}
          fieldWidth={fieldWidth}
          ariaLabel={L.userName}
        />
      </div>

      {/* ボタン群（左右キー操作＋Enter/Esc 付き） */}
      <ActionsRow
        className="mt-6"
        cancelLabel={cancelLabel}
        confirmLabel={confirmLabel}
        onCancel={onCancel}
        onConfirm={onConfirm}
        horizontalOnly
      />
    </div>
  );
}
