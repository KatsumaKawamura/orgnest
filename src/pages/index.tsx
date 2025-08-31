// /pages/index.tsx
"use client";

import { useState } from "react";
import LoginModal from "@/components/auth/LoginModal";
import RegisterModal from "@/components/auth/RegisterModal";
import BaseModal from "@/components/common/modal/BaseModal";
import FormModal from "@/components/common/modal/FormModal"; // ← 新しく import
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

      {/* Login（シンプルなので BaseModal のまま） */}
      <BaseModal
        open={showLogin}
        onClose={() => setShowLogin(false)}
        backdropProps={{ className: "fixed inset-0 z-[1000] bg-black/50" }}
        containerProps={{
          className: "fixed inset-0 grid place-items-center p-4",
        }}
      >
        <LoginModal onClose={() => setShowLogin(false)} />
      </BaseModal>

      {/* Register（スマホ対応が必要なので FormModal を使用） */}
      <FormModal
        open={showRegister}
        onClose={() => setShowRegister(false)}
        backdropProps={{ className: "fixed inset-0 z-[1000] bg-black/50" }}
        containerProps={{
          className: "fixed inset-0 grid place-items-center p-4",
        }}
      >
        <RegisterModal onClose={() => setShowRegister(false)} />
      </FormModal>
    </div>
  );
}
