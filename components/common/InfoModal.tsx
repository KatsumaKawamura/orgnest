// components/common/InfoModal.tsx
"use client";
import { forwardRef, useId } from "react";
import ActionsRow from "@/components/common/ActionsRow";

interface InfoModalProps extends React.ComponentProps<"div"> {
  title?: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;

  /** フッターの見た目/配置を上書きしたいときに */
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

const InfoModal = forwardRef<HTMLDivElement, InfoModalProps>(
  (
    {
      title = "お知らせ",
      message,
      confirmLabel = "OK",
      onConfirm,
      className,
      actions,
      ...rest
    },
    ref
  ) => {
    const baseId = useId();
    const titleId = `info-title-${baseId}`;
    const descId = `info-desc-${baseId}`;

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
            onConfirm={onConfirm}
            showCancel={false}
            horizontalOnly
            align="center"
            size="md"
            {...actions}
          />
        </div>
      </div>
    );
  }
);

export default InfoModal;
