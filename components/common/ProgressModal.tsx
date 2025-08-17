// components/common/ProgressModal.tsx
"use client";

import { forwardRef, useEffect, useId, useRef } from "react";
import ActionsRow from "@/components/common/ActionsRow";

type Status = "processing" | "done";

interface ProgressModalProps extends React.ComponentProps<"div"> {
  title?: string;
  processingText?: string;
  doneText?: string;
  confirmLabel?: string; // done時のOKラベル
  status: Status; // "processing" | "done"
  onConfirm: () => void; // OK押下時
  actions?: Partial<
    Pick<
      React.ComponentProps<typeof ActionsRow>,
      | "size"
      | "confirmVariant"
      | "align"
      | "className"
      | "confirmClassName"
      | "horizontalOnly"
    >
  >;
}

const ProgressModal = forwardRef<HTMLDivElement, ProgressModalProps>(
  (
    {
      title = "お知らせ",
      processingText = "処理中……",
      doneText = "完了しました",
      confirmLabel = "OK",
      status,
      onConfirm,
      className,
      actions,
      ...rest
    },
    ref
  ) => {
    const baseId = useId();
    const titleId = `progress-title-${baseId}`;
    const descId = `progress-desc-${baseId}`;
    const processing = status === "processing";

    // OKボタンを done 出現時にフォーカス
    const okRef = useRef<HTMLButtonElement>(null);
    useEffect(() => {
      if (!processing) {
        (queueMicrotask ?? ((cb: () => void) => setTimeout(cb, 0)))(() =>
          okRef.current?.focus()
        );
      }
    }, [processing]);

    return (
      <div
        ref={ref}
        {...rest}
        className={[
          "w-full max-w-sm sm:w-80 sm:max-w-none bg-white rounded-md shadow-md text-gray-900 flex flex-col",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {/* Header：ARIAのための説明はsr-onlyで保持 */}
        <div className="p-6 pb-4">
          <h2
            id={titleId}
            data-modal-title
            className="text-lg font-semibold mb-2 text-center"
          >
            {title}
          </h2>
          <p id={descId} data-modal-desc className="sr-only" aria-live="polite">
            {processing ? processingText : doneText}
          </p>
        </div>

        {/* Body */}
        <div className="px-6 pb-24 sm:pb-6 flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center text-center">
            <p className="text-gray-700" aria-hidden>
              {processing ? processingText : doneText}
            </p>
            <div className="mt-3 h-5 flex items-center justify-center">
              <span
                aria-hidden
                className={
                  processing
                    ? "inline-block animate-spin motion-reduce:animate-none rounded-full border-2 border-gray-900 border-r-transparent"
                    : "inline-block rounded-full border-2 border-transparent"
                }
                style={{
                  width: 20,
                  height: 20,
                  visibility: processing ? "visible" : "hidden",
                }}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div
          className="
            sticky bottom-0 bg-white/95 supports-[backdrop-filter]:bg-white/60 backdrop-blur p-4
            sm:static sm:border-0 sm:bg-transparent sm:backdrop-blur-0 sm:p-6 sm:pt-0
          "
          style={{
            paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)",
          }}
        >
          <ActionsRow
            cancelLabel="キャンセル" // 非表示
            confirmLabel={confirmLabel}
            onCancel={() => {
              /* no-op */
            }}
            onConfirm={onConfirm} // 現行挙動：onConfirm → close を維持
            showCancel={false}
            confirmDisabled={processing} // 処理中は押せない
            confirmFirst // ← 実行順を維持（onConfirm → close）
            horizontalOnly
            align="center"
            size="md"
            confirmClassName={processing ? "invisible" : undefined} // 既存見た目を踏襲
            {...actions}
          />
        </div>
      </div>
    );
  }
);

export default ProgressModal;
