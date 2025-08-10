// /pages/sandbox/index.tsx
"use client";

import { useState } from "react";
import Button from "@/components/common/Button";
import FadeModalWrapper from "@/components/common/FadeModalWrapper";
import ProgressModal from "@/components/common/ProgressModal";

export default function SandboxPage() {
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState<"processing" | "done">("processing");

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const startRegisterFlow = async () => {
    setStatus("processing");
    setShow(true);
    // 処理中を疑似的に再現（1.2秒）
    await sleep(800);
    setStatus("done");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm space-y-4 text-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Progress Modal Test
        </h1>
        <Button
          variant="primary"
          size="responsive"
          fullWidth
          onClick={startRegisterFlow}
        >
          登録フローを開始
        </Button>
      </div>

      {show && (
        <FadeModalWrapper
          onClose={() => setShow(false)}
          closeOnBackdrop={false}
          closeOnEsc={false}
        >
          <ProgressModal
            title="ログイン"
            processingText="ログイン中……"
            doneText="ログイン完了"
            confirmLabel="OK"
            status={status}
            onConfirm={() => setShow(false)}
          />
        </FadeModalWrapper>
      )}
    </div>
  );
}
