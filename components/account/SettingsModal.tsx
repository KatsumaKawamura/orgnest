// @/components/account/SettingsModal.tsx
"use client";

import { useEffect, useState } from "react";
import SettingsFormCard from "@/components/account/SettingsFormCard";
import { useAuthForm } from "@/hooks/forms/useAuthForm";

export type Me = {
  login_id: string;
  user_name: string | null;
  contact: string | null;
};

export interface SettingsModalProps {
  onClose: () => void;
  initial?: Me;
  onUpdated?: (me: Me) => void;
}

type Phase = "loading" | "form" | "saving" | "done" | "error";

export default function SettingsModal({
  onClose,
  initial,
  onUpdated,
}: SettingsModalProps) {
  const [me, setMe] = useState<Me | null>(initial ?? null);
  const [phase, setPhase] = useState<Phase>(initial ? "form" : "loading");
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Escで閉じる
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // me を取得
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (initial) return;
      try {
        const res = await fetch("/api/account/me", {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
        });
        if (!mounted) return;
        if (!res.ok) {
          setPhase("error");
          setGeneralError("ユーザー情報の取得に失敗しました");
          return;
        }
        const data = await res.json();
        setMe({
          login_id: data.login_id,
          user_name: data.user_name,
          contact: data.contact,
        });
        setPhase("form");
      } catch {
        if (!mounted) return;
        setPhase("error");
        setGeneralError("ネットワークエラーが発生しました");
      }
    })();
    return () => {
      mounted = false;
    };
  }, [initial]);

  const vm = useAuthForm({
    mode: "update",
    initial: me ?? undefined,
  });

  const handleSave = async () => {
    setGeneralError(null);
    setPhase("saving");
    try {
      const body: Record<string, unknown> = {};
      if (me && vm.values.userId !== me.login_id)
        body.login_id = vm.values.userId;
      if (vm.values.password) body.password = vm.values.password;
      if ((vm.values.userName || null) !== (me?.user_name ?? null))
        body.user_name = vm.values.userName || null;
      if ((vm.values.contact || null) !== (me?.contact ?? null))
        body.contact = vm.values.contact || null;

      if (Object.keys(body).length === 0) {
        setPhase("form");
        return;
      }

      const res = await fetch("/api/account/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const code = data?.error || "INTERNAL_ERROR";
        if (code === "LOGIN_ID_TAKEN") {
          setGeneralError("この USER_ID は既に使用されています");
        } else if (code === "LOGIN_ID_INVALID") {
          setGeneralError("USER_ID の形式が不正です");
        } else if (code === "PASSWORD_TOO_SHORT") {
          setGeneralError("PASSWORD が短すぎます");
        } else if (code === "NO_CHANGES") {
          setGeneralError("変更がありません");
        } else if (code === "UNAUTHORIZED") {
          setGeneralError("認証が必要です");
        } else {
          setGeneralError("更新に失敗しました");
        }
        setPhase("form");
        return;
      }

      const data = await res.json();
      const updated: Me = {
        login_id: data.user.login_id,
        user_name: data.user.user_name,
        contact: data.user.contact,
      };
      setMe(updated);
      onUpdated?.(updated);
      setPhase("done");
      onClose();
    } catch {
      setGeneralError("ネットワークエラーが発生しました");
      setPhase("form");
    }
  };

  return (
    <ModalShell onClose={onClose}>
      {phase === "loading" && (
        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow">
          <p className="text-sm text-gray-700 text-center">読み込み中…</p>
        </div>
      )}

      {(phase === "form" || phase === "saving" || phase === "error") && me && (
        <SettingsFormCard
          values={vm.values}
          setters={vm.setters}
          fieldErrors={vm.fieldErrors}
          availability={vm.availability}
          checking={vm.checking}
          canSubmit={vm.canSubmit}
          dirty={vm.dirty}
          onCancel={onClose}
          onSubmit={handleSave}
          busy={phase === "saving"}
          generalError={generalError}
        />
      )}
    </ModalShell>
  );
}

function ModalShell({
  onClose,
  children,
}: {
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      aria-modal
      role="dialog"
    >
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative z-[1001] w-full max-w-md">{children}</div>
    </div>
  );
}
