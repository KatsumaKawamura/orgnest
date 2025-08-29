// @/components/common/modal/ProgressDialog.tsx
"use client";

import BaseModal from "@/components/common/modal/BaseModal";
import Button from "@/components/common/Button";
import { Loader2, CheckCircle2, CircleAlert } from "lucide-react";

type Status = "processing" | "done" | "error";
type ActionsMode = "full" | "none";

export interface ProgressDialogProps {
  open: boolean;
  status: Status;
  /** 表示メッセージ（未指定時は status に応じた既定文言） */
  message?: string;

  /** アクションの描画方法：既定は "full"（done=OK、error=再試行/閉じる） */
  actions?: ActionsMode;

  /** done の OK 押下時 */
  onOk?: () => void;
  /** error の 再試行 押下時 */
  onRetry?: () => void;
  /** error の 閉じる 押下時（または上位が閉じたい時） */
  onClose?: () => void;

  /** ラベル差し替え（省略可） */
  okLabel?: string; // 既定: "OK"
  retryLabel?: string; // 既定: "再試行"
  closeLabel?: string; // 既定: "閉じる"
}

/**
 * ProgressDialog
 * - 内部で BaseModal を使用（Esc/Backdrop は BaseModal 既定で無効 = 操作凍結）
 * - actions="none" で待機専用の完全ブロッキング表示にできる
 * - z-index はデフォルトで 1100（RegisterModal の 1000 より上）に設定
 */
export default function ProgressDialog({
  open,
  status,
  message,
  actions = "full",
  onOk,
  onRetry,
  onClose,
  okLabel = "OK",
  retryLabel = "再試行",
  closeLabel = "閉じる",
}: ProgressDialogProps) {
  const defaults: Record<Status, { title: string; msg: string }> = {
    processing: { title: "処理中", msg: "処理を実行しています…" },
    done: { title: "完了", msg: "処理が完了しました。" },
    error: { title: "エラー", msg: "エラーが発生しました。" },
  };

  const title = defaults[status].title;
  const bodyMessage = message ?? defaults[status].msg;

  const showFooter =
    actions !== "none" && (status === "done" || status === "error");

  return (
    <BaseModal
      open={open}
      onClose={() => {
        // Esc/Backdrop は無効だが、将来 onClose を BaseModal 側で有効化した際の保険
        if (status === "error") onClose?.();
      }}
      backdropProps={{ className: "fixed inset-0 z-[1100] bg-black/50" }}
      containerProps={{
        className: "fixed inset-0 grid place-items-center p-4",
      }}
      // Esc/Backdrop は既定で false（=無効）
    >
      <div
        className="w-full max-w-md rounded-lg bg-white p-6 shadow bm-enter"
        role="dialog"
        aria-modal="true"
        aria-labelledby="progress-dialog-title"
      >
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-3">
            {status === "processing" && (
              <Loader2
                className="h-8 w-8 animate-spin text-gray-800"
                aria-hidden
              />
            )}
            {status === "done" && (
              <CheckCircle2 className="h-8 w-8 text-green-600" aria-hidden />
            )}
            {status === "error" && (
              <CircleAlert className="h-8 w-8 text-red-600" aria-hidden />
            )}
          </div>

          <h3
            id="progress-dialog-title"
            className="text-base font-semibold text-gray-900"
          >
            {title}
          </h3>

          <p className="mt-2 text-sm text-gray-700">{bodyMessage}</p>
        </div>

        {/* Footer */}
        {showFooter && (
          <div className="mt-6 flex justify-center gap-3">
            {status === "done" && (
              <Button
                onClick={onOk}
                autoFocus
                className="min-w-32 w-auto px-4 justify-self-center"
              >
                {okLabel}
              </Button>
            )}

            {status === "error" && (
              <>
                <Button
                  onClick={onRetry}
                  className="min-w-32 w-auto px-4 justify-self-center"
                >
                  {retryLabel}
                </Button>
                <Button
                  variant="secondary"
                  onClick={onClose}
                  className="min-w-32 w-auto px-4 justify-self-center"
                >
                  {closeLabel}
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </BaseModal>
  );
}
