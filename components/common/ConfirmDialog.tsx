"use client";

import ActionsRow, { ActionsRowProps } from "@/components/common/ActionsRow";
import { ReactNode } from "react";

/** 長期運用前提の安定API */
export interface ConfirmDialogProps {
  title?: ReactNode;
  message?: ReactNode | ReactNode[]; // 配列もOK（箇条書き）
  onConfirm: () => void;
  onCancel: () => void;

  /** ラベル（軽いカスタムはここで） */
  confirmLabel?: string;
  cancelLabel?: string;

  /**
   * アクション行の拡張設定は actions に集約。
   * - ボタンサイズ/バリアント/レイアウト/クラス上書き等
   */
  actions?: Partial<
    Pick<
      ActionsRowProps,
      | "size"
      | "confirmVariant"
      | "align"
      | "className"
      | "confirmClassName"
      | "cancelClassName"
      | "horizontalOnly"
    >
  >;

  /**
   * 互換: 旧い呼び出しが直接渡していた props を残置（内部で actions に橋渡し）
   * @deprecated Use `actions.confirmClassName` / `actions.cancelClassName` / `actions.className` (or `actions.align`)
   */
  confirmClassName?: string;
  /** @deprecated Use `actions.cancelClassName` */
  cancelClassName?: string;
  /** @deprecated Use `actions.className` or `actions.align` */
  position?: string;

  /** FadeModalWrapper(asChild) 前提のダイアログ（既定: true） */
  asModalChild?: boolean;
}

export default function ConfirmDialog({
  title = "確認",
  message = "よろしいですか？",
  confirmLabel = "OK",
  cancelLabel = "キャンセル",
  onConfirm,
  onCancel,
  actions,
  // 互換（内部で actions にマージ）
  confirmClassName,
  cancelClassName,
  position,
  asModalChild = true,
}: ConfirmDialogProps) {
  const renderMessage = (msg: ReactNode | ReactNode[]) => {
    if (Array.isArray(msg)) {
      return (
        <ul className="list-disc pl-5 space-y-1 text-left inline-block">
          {msg.map((m, i) => (
            <li key={i}>{m}</li>
          ))}
        </ul>
      );
    }
    return <p>{msg}</p>;
  };

  const Panel = (
    <div className="rounded-xl bg-white shadow-xl p-6 w-[min(92vw,420px)] text-gray-900 text-center">
      <h2 className="text-lg font-semibold mb-3" data-modal-title>
        {title}
      </h2>
      <div className="text-sm leading-6">{renderMessage(message)}</div>

      <ActionsRow
        cancelLabel={cancelLabel}
        confirmLabel={confirmLabel}
        onCancel={onCancel}
        onConfirm={onConfirm}
        horizontalOnly
        // 新API：actions に集約
        {...actions}
        // 互換（deprecated）→ actions に橋渡し
        confirmClassName={actions?.confirmClassName ?? confirmClassName}
        cancelClassName={actions?.cancelClassName ?? cancelClassName}
        className={
          actions?.className ?? position /* position を暫定的に className へ */
        }
      />
    </div>
  );

  if (!asModalChild) return Panel;
  return Panel;
}
