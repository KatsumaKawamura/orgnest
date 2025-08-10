"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/common/Button";
import InfoModal from "@/components/common/InfoModal";
import ProgressModal from "@/components/common/ProgressModal";
import FadeModalWrapper, {
  useFadeModal,
} from "@/components/common/FadeModalWrapper";
import Input from "@/components/common/Input";
import useModalActionRoving from "@/hooks/useModalActionRoving"; // ← 追加

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

  // ←/→ で外から引き込み & 行内 roving
  // 入力中でも左右で引き込みたい要件なので overrideInput: true（既定のまま）
  const { rowRef, onRootKeyDown } = useModalActionRoving({
    loop: true,
    overrideInput: true,
  });

  const handleCancel = () => {
    close();
  };

  const handleLogin = async () => {
    if (submitting) return;

    // 入力不足は即座に InfoModal
    if (userId.trim() === "" || password.trim() === "") {
      setInfo({
        title: "ログイン失敗",
        message: "USER_ID と PASSWORD を入力してください。",
      });
      return;
    }

    setSubmitting(true);

    // 通信時は Progress 表示
    setProgressStatus("processing");
    setShowProgress(true);
    const start = performance.now();

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login_id: userId, password }),
      });
      const data = await res.json();

      const elapsed = performance.now() - start;
      if (elapsed < MIN_PROGRESS_MS) await sleep(MIN_PROGRESS_MS - elapsed);

      if (!res.ok) {
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

  const handleProgressConfirm = () => {
    close();
    router.push("/mypage");
  };

  return (
    <>
      {/* ←/→ を拾うのは“モーダルのパネル全体” */}
      <div
        role="dialog"
        aria-modal="true"
        className="bg-white text-gray-800 p-6 rounded shadow-lg w-80"
        onKeyDown={onRootKeyDown} // ← 追加: 外からの引き込み & 行内 roving
      >
        <h2 className="text-lg font-semibold mb-4">ログイン</h2>

        <Input
          type="text"
          placeholder="USER_ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="mb-3"
          disabled={submitting}
        />
        <Input
          type="password"
          placeholder="PASSWORD"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4"
          disabled={submitting}
        />

        {/* アクション行（ボタン群） */}
        <div
          ref={rowRef} // ← 追加
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
            data-action="cancel" // ← 追加: 左からの引き込み先
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
            data-action="primary" // ← 追加: 右からの引き込み先
          >
            ログイン
          </Button>
        </div>
      </div>

      {/* 成功時の演出：ProgressModal（最低表示あり） */}
      {showProgress && (
        <FadeModalWrapper
          onClose={() => setShowProgress(false)}
          closeOnBackdrop={false}
          closeOnEsc={false}
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

      {/* エラー通知：入力不足・失敗・通信エラー */}
      {info && (
        <FadeModalWrapper onClose={() => setInfo(null)} durationOpen={450}>
          <InfoModal
            title={info.title}
            message={info.message}
            onConfirm={() => setInfo(null)}
          />
        </FadeModalWrapper>
      )}
    </>
  );
}
