// pages/index.tsx
"use client";

import { useState } from "react";
import LoginModal from "@/components/auth/LoginModal";
import RegisterModal from "@/components/auth/RegisterModal";
import FadeModalWrapper from "@/components/common/FadeModalWrapper";
import Button from "@/components/common/Button";
import { useRovingFocus } from "@/hooks/useRovingFocus";

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  // ↑↓で移動（縦並び）。未フォーカスからの復帰・キーリピート無視・再フォーカスもフック内で処理
  const { getItemProps } = useRovingFocus<HTMLButtonElement>({
    length: 2,
    orientation: "vertical",
    loop: true,
    initialIndex: 0,
  });

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-surface px-4"
      role="group"
      aria-label="Auth actions"
      aria-orientation="vertical"
    >
      <div className="w-full max-w-sm rounded-lg bg-white p-8 text-center shadow-md">
        <h1 className="mb-6 text-2xl font-bold text-gray-800">
          Welcome to OrgNest
        </h1>

        <div className="flex flex-col space-y-4">
          <Button
            {...getItemProps(0)}
            variant="primary"
            size="responsive"
            fullWidth
            onClick={() => setShowLogin(true)}
          >
            ログイン
          </Button>

          <Button
            {...getItemProps(1)}
            variant="secondary"
            size="responsive"
            fullWidth
            onClick={() => setShowRegister(true)}
          >
            アカウント作成
          </Button>
        </div>
      </div>

      {showLogin && (
        <FadeModalWrapper onClose={() => setShowLogin(false)}>
          <LoginModal onClose={() => setShowLogin(false)} />
        </FadeModalWrapper>
      )}

      {showRegister && (
        <FadeModalWrapper onClose={() => setShowRegister(false)}>
          <RegisterModal onClose={() => setShowRegister(false)} />
        </FadeModalWrapper>
      )}
    </div>
  );
}
