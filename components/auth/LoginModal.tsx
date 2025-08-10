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

  const handleCancel = () => {
    close();
  };

  const handleLogin = async () => {
    if (submitting) return;

    // ✅ ここで入力不足を即時チェック（Progressは出さずにInfoModalだけ表示）
    if (userId.trim() === "" || password.trim() === "") {
      setInfo({
        title: "ログイン失敗",
        message: "USER_ID と PASSWORD を入力してください。",
      });
      return; // 早期終了：以降のProgress処理に入らない
    }

    setSubmitting(true);

    // 以降は通信が走るのでProgressを表示
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
      <div className="bg-white text-gray-800 p-6 rounded shadow-lg w-80">
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

        <div className="flex justify-between">
          <Button
            variant="secondary"
            size="md"
            onClick={handleCancel}
            disabled={submitting}
            type="button"
            data-enter-ignore // ← Enterの自動ターゲットから除外
          >
            キャンセル
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleLogin}
            disabled={submitting}
            type="button"
            data-enter // ← Enterは必ずこちらを押す
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
