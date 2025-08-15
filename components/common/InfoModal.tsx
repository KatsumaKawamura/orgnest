// components/common/InfoModal.tsx
"use client";
import { forwardRef, useId } from "react";
import Button from "@/components/common/Button";
import { useFadeModal } from "@/components/common/FadeModalWrapper";

interface InfoModalProps extends React.ComponentProps<"div"> {
  title?: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
}

const InfoModal = forwardRef<HTMLDivElement, InfoModalProps>(
  (
    {
      title = "お知らせ",
      message,
      confirmLabel = "OK",
      onConfirm,
      className,
      ...rest
    },
    ref
  ) => {
    const { close } = useFadeModal();
    const baseId = useId();
    const titleId = `info-title-${baseId}`;
    const descId = `info-desc-${baseId}`;

    const handleConfirm = () => {
      close();
      onConfirm();
    };

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
        {/* Header */}
        <div className="p-6 pb-4">
          <h2
            id={titleId}
            data-modal-title
            className="text-lg font-semibold mb-2 text-center"
          >
            {title}
          </h2>
          <p id={descId} data-modal-desc className="text-gray-700 text-center">
            {message}
          </p>
        </div>

        {/* Body（スマホは下のバー分だけ余白多め） */}
        <div className="px-6 pb-24 sm:pb-6" />

        {/* Action Bar */}
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
            data-autofocus
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    );
  }
);

export default InfoModal;
