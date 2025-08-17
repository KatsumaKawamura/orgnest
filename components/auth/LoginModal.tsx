// components/auth/LoginModal.tsx
"use client";
import { useState } from "react";
// Pages Router
import { useRouter } from "next/router";
import Button from "@/components/common/Button";
import InfoModal from "@/components/common/InfoModal";
import ProgressModal from "@/components/common/ProgressModal";
import FadeModalWrapper, {
  useFadeModal,
} from "@/components/common/FadeModalWrapper";
import Input from "@/components/common/Input";
import PasswordInput from "@/components/common/PasswordInput";
import useModalActionRoving from "@/hooks/useModalActionRoving";
import useArrowFormNav from "@/hooks/useArrowFormNav";

interface LoginModalProps {
  onClose: () => void;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const MIN_PROGRESS_MS = 800;

export default function LoginModal({ onClose }: LoginModalProps) {
  const router = useRouter();
  const { close } = useFadeModal();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [showProgress, setShowProgress] = useState(false);
  const [progressStatus, setProgressStatus] = useState<"processing" | "done">(
    "processing"
  );

  const [info, setInfo] = useState<{ title: string; message: string } | null>(
    null
  );

  // ←/→：外から引き込み & 行内 roving（ボタン用）
  const { rowRef, onRootKeyDown } = useModalActionRoving({
    loop: true,
    overrideInput: true,
  });

  // ↑/↓：フォーム間ナビ（常に奪う・外から↑=一番上/↓=一番下・フォーカス時は末尾）
  const { formRef, onKeyDown: onFormKeyDown } = useArrowFormNav({
    loop: true,
    pullIn: true,
    caretOnFocus: "end",
  });

  const handleCancel = () => {
    close();
  };

  const handleLogin = async () => {
    if (submitting) return;

    if (userId.trim() === "" || password.trim() === "") {
      setInfo({
        title: "ログイン失敗",
        message: "USER_ID と PASSWORD を入力してください。",
      });
      return;
    }

    setSubmitting(true);
    setProgressStatus("processing");
    setShowProgress(true);
    const start = performance.now();

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login_id: userId, password }),
        credentials: "same-origin",
      });
      const data = await res.json();

      const elapsed = performance.now() - start;
      if (elapsed < MIN_PROGRESS_MS) await sleep(MIN_PROGRESS_MS - elapsed);

      if (!res.ok) {
        // 失敗：プログレスを閉じ、エラーInfoを開く
        setShowProgress(false);
        setInfo({
          title: "ログイン失敗",
          message: data.error || "ログインに失敗しました。",
        });
        return;
      }

      setProgressStatus("done");
    } catch {
      const elapsed = performance.now() - start;
      if (elapsed < MIN_PROGRESS_MS) await sleep(MIN_PROGRESS_MS - elapsed);
      setShowProgress(false);
      setInfo({ title: "通信エラー", message: "通信エラーが発生しました。" });
    } finally {
      setSubmitting(false);
    }
  };

  // push → close
  const handleProgressConfirm = () => {
    router.push("/mypage");
    setTimeout(() => close(), 0);
  };

  return (
    <>
      <div
        ref={formRef}
        className="bg-white text-gray-800 p-6 rounded shadow-lg w-80"
        onKeyDown={(e) => {
          onFormKeyDown(e); // ↑/↓ 最優先
          onRootKeyDown(e); // ←/→（ボタン roving）
        }}
      >
        <h2 className="text-lg font-semibold mb-4" data-modal-title>
          ログイン
        </h2>

        <Input
          type="text"
          placeholder="USER_ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="mb-3"
          disabled={submitting}
        />
        <PasswordInput
          placeholder="PASSWORD"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4"
          disabled={submitting}
        />

        <div
          ref={rowRef}
          role="group"
          aria-orientation="horizontal"
          className="flex justify-between"
        >
          <Button
            variant="secondary"
            size="md"
            onClick={handleCancel}
            disabled={submitting}
            type="button"
            data-enter-ignore
            data-action="cancel"
          >
            キャンセル
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={handleLogin}
            disabled={submitting}
            type="button"
            data-enter
            data-action="primary"
          >
            ログイン
          </Button>
        </div>
      </div>

      {/* 成功時 Progress（asChild で中身が“パネル本体”に） */}
      {showProgress && (
        <FadeModalWrapper
          onClose={() => setShowProgress(false)} // ← フェード完了後にだけアンマウント
          closeOnBackdrop={false}
          closeOnEsc={false}
          asChild
        >
          <ProgressModal
            title="ログイン"
            processingText="ログイン中……"
            doneText="ログイン成功"
            confirmLabel="OK"
            status={progressStatus}
            onConfirm={handleProgressConfirm}
          />
        </FadeModalWrapper>
      )}

      {/* エラー通知 Info（asChild） */}
      {info && (
        <FadeModalWrapper
          onClose={() => setInfo(null)} // ← フェード完了後にだけアンマウント
          durationOpen={450}
          durationClose={700} // ← 閉じフェードを長めに
          asChild
        >
          <InfoModal
            title={info.title}
            message={info.message}
            onConfirm={() => {}} // ← ここで setInfo(null) しない（close() は子側で呼ばれる）
          />
        </FadeModalWrapper>
      )}
    </>
  );
}
