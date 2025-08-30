"use client";

import { useState } from "react";
import Button from "@/components/common/Button";
import { Eye, EyeOff } from "lucide-react";
import type { TeamRegisterValues } from "./TeamRegisterFormCard";

export interface TeamRegisterReviewDialogProps {
  values: TeamRegisterValues;
  onBack: () => void;
  onConfirm: () => void;
}

export default function TeamRegisterReviewDialog({
  values,
  onBack,
  onConfirm,
}: TeamRegisterReviewDialogProps) {
  const [showPassword, setShowPassword] = useState(false);
  const masked = "•".repeat(values.password.length);

  return (
    <>
      <h3 className="text-base font-semibold text-gray-900 text-center">
        入力内容の確認
      </h3>

      <div className="mt-5 space-y-3 text-sm">
        <Row label="TEAM_ID" value={values.teamId} />

        {/* PASSWORD（行内 Eye/EyeOff トグル） */}
        <div className="flex items-center justify-between rounded border border-gray-200 px-3 py-2">
          <div className="text-gray-600">PASSWORD</div>
          <div className="max-w-[60%] flex items-center gap-2">
            <span className="truncate text-gray-900 font-mono">
              {showPassword ? values.password : masked}
            </span>
            <button
              type="button"
              className="p-1 text-gray-600 hover:text-gray-900"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={
                showPassword ? "パスワードを隠す" : "パスワードを表示"
              }
              aria-pressed={showPassword}
              title={showPassword ? "パスワードを隠す" : "パスワードを表示"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <Row label="CONTACT" value={values.contact || "（未入力）"} />
        <Row label="TEAM_NAME" value={values.teamName || "（未入力）"} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 justify-items-center">
        <Button variant="secondary" onClick={onBack}>
          戻る
        </Button>
        <Button onClick={onConfirm}>作成する</Button>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded border border-gray-200 px-3 py-2">
      <div className="text-gray-600">{label}</div>
      <div className="max-w-[60%] truncate text-gray-900">{value}</div>
    </div>
  );
}
