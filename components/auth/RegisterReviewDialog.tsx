"use client";

import { useMemo, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import ActionsRow from "@/components/common/ActionsRow";

type Values = {
  userId: string;
  password: string;
  contact?: string;
  userName?: string;
};

type Labels = Partial<Record<keyof Values, string>>;

type Row = {
  key: "userId" | "password" | "contact" | "userName";
  label: string;
  value: string;
  /** パスワード行のみ true にする（他は undefined のまま） */
  canToggle?: boolean;
};

type Props = {
  title?: string;
  values: Values;
  labels?: Labels;
  maskPassword?: boolean;
  cancelLabel?: string;
  confirmLabel?: string;
  /** ActionsRow が close() → その後に呼ぶ（＝フェード後） */
  onCancel: () => void;
  onConfirm: () => void;
};

export default function RegisterReviewDialog({
  title = "入力内容の確認",
  values,
  labels,
  maskPassword = true,
  cancelLabel = "戻る",
  confirmLabel = "登録する",
  onCancel,
  onConfirm,
}: Props) {
  const [showPassword, setShowPassword] = useState(!maskPassword);

  const rows: Row[] = useMemo(() => {
    const l = {
      userId: labels?.userId ?? "USER_ID",
      password: labels?.password ?? "PASSWORD",
      contact: labels?.contact ?? "CONTACT",
      userName: labels?.userName ?? "USER_NAME",
    };
    return [
      { key: "userId", label: l.userId, value: values.userId },
      {
        key: "password",
        label: l.password,
        value: showPassword ? values.password : "••••••••",
        canToggle: true,
      },
      {
        key: "contact",
        label: l.contact,
        value: values.contact ?? "（未入力）",
      },
      {
        key: "userName",
        label: l.userName,
        value: values.userName ?? "（未入力）",
      },
    ];
  }, [values, labels, showPassword]);

  return (
    <div className="rounded-xl bg-white shadow-xl p-6 w-[min(92vw,480px)] text-gray-900">
      <h2 className="text-lg font-semibold mb-4 text-center" data-modal-title>
        {title}
      </h2>

      <div className="space-y-3 text-sm">
        {rows.map((r) => (
          <div
            key={r.key}
            className="flex items-center justify-between gap-3 border-b pb-2"
          >
            <div className="text-gray-600 min-w-28">{r.label}</div>
            <div className="flex-1 text-right break-all">
              {r.value}
              {r.canToggle && (
                <button
                  type="button"
                  className="inline-flex items-center ml-2 text-gray-600 hover:text-gray-900"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={
                    showPassword ? "パスワードを隠す" : "パスワードを表示"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* フッター：close() → onCancel/onConfirm（＝フェードしてから消える） */}
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
