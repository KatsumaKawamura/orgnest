// components/common/ProgressModal.tsx
"use client";

import { useId } from "react";
import Button from "@/components/common/Button";
import { useFadeModal } from "@/components/common/FadeModalWrapper";

type Status = "processing" | "done";

interface ProgressModalProps {
  title?: string;
  processingText?: string;
  doneText?: string;
  confirmLabel?: string; // done時のOKラベル
  status: Status; // "processing" | "done"
  onConfirm: () => void; // OK押下時
}

export default function ProgressModal({
  title = "お知らせ",
  processingText = "処理中……",
  doneText = "完了しました",
  confirmLabel = "OK",
  status,
  onConfirm,
}: ProgressModalProps) {
  const { close } = useFadeModal();
  const baseId = useId();
  const titleId = `progress-title-${baseId}`;
  const descId = `progress-desc-${baseId}`;
  const processing = status === "processing";

  const handleConfirm = () => {
    close();
    onConfirm();
  };

  return (
    <div
      className="
        w-full max-w-sm sm:w-80 sm:max-w-none
        bg-white rounded-md shadow-md text-gray-900
        flex flex-col
      "
    >
      {/* Header：見出しは常に固定。ARIAのための説明はsr-onlyで保持 */}
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

      {/* Body：テキストを常に“縦中央”。スピナーはその直下。 */}
      <div className="px-6 pb-24 sm:pb-6 flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center text-center">
          {/* 表示用テキスト（中央配置） */}
          <p className="text-gray-700" aria-hidden>
            {processing ? processingText : doneText}
          </p>

          {/* スピナー行：処理中だけ見せる。高さは常に確保してレイアウトを安定化 */}
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

      {/* Action Bar：処理中はボタンを不可視＋無効。完了時にそのまま現れる */}
      <div
        className="
          sticky bottom-0 bg-white/95 supports-[backdrop-filter]:bg-white/60 backdrop-blur p-4
          sm:static sm:border-0 sm:bg-transparent sm:backdrop-blur-0 sm:p-6 sm:pt-0
          sm:flex sm:justify-center
        "
        style={{
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)",
        }}
      >
        <Button
          type="button"
          variant="primary"
          size="responsive"
          fullWidth
          onClick={handleConfirm}
          disabled={processing}
          data-autofocus={processing ? undefined : true}
          data-enter-ignore={processing ? true : undefined}
          className={processing ? "invisible" : undefined}
        >
          {confirmLabel}
        </Button>
      </div>
    </div>
  );
}
