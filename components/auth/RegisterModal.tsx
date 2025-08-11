// components/auth/RegisterModal.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/router"; // ← Pages Router
import FadeModalWrapper, {
  useFadeModal,
} from "@/components/common/FadeModalWrapper";
import InfoModal from "@/components/common/InfoModal";
import ProgressModal from "@/components/common/ProgressModal";
import RegisterFormCard from "@/components/auth/RegisterFormCard";
import { useRegisterForm } from "@/hooks/useRegisterForm";
import { useProgressOverlay } from "@/hooks/useProgressOverlay";
import useModalActionRoving from "@/hooks/useModalActionRoving";

interface RegisterModalProps {
  onClose: () => void;
}

export default function RegisterModal({ onClose }: RegisterModalProps) {
  const router = useRouter();
  const { close } = useFadeModal();

  // 入力 + リアルタイム検証（必須 / 一致 / 可用性）
  const form = useRegisterForm();

  // 進捗オーバーレイ（最低表示時間は hook 側で担保）
  const { show, setShow, status, runWithMinDelay } = useProgressOverlay();

  // API 失敗などの通知用
  const [info, setInfo] = useState<{ title: string; message: string } | null>(
    null
  );

  // 連打防止・フォームロック
  const [submitting, setSubmitting] = useState(false);

  // ←/→：外から“引き込み” & 行内 roving（右＝登録、左＝キャンセル）
  const { rowRef, onRootKeyDown } = useModalActionRoving({
    loop: true,
    overrideInput: true,
  });

  const handleCancel = () => {
    close();
    onClose?.();
  };

  const handleRegister = async () => {
    if (submitting || form.hasBlockingError || form.checking) return;

    setSubmitting(true);

    // Progress を表示しつつ最低表示時間を担保して /api/register を実行
    const { ok, error } = await runWithMinDelay(async () => {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          login_id: form.userId,
          password: form.password,
          contact: form.contact,
          user_name: form.userName,
        }),
        credentials: "same-origin", // 明示（環境差吸収）
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "登録に失敗しました");
      return data;
    });

    setSubmitting(false);

    if (!ok) {
      // 失敗時：Progress は hook 側で閉じ済。Info を開く
      setInfo({ title: "登録失敗", message: (error as Error).message });
    }
    // 成功時：Progress 側が "done" 表示 → OK で onConfirm が呼ばれる
  };

  // ✅ 登録完了 → OK：自動ログイン → 遷移（push→close の順）
  const handleProgressConfirm = async () => {
    try {
      // まず自動ログイン（登録と同じ認証情報で）
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          login_id: form.userId,
          password: form.password,
        }),
        credentials: "same-origin",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "自動ログインに失敗しました");

      // セッション発行が成功したら遷移
      router.push("/mypage");

      // 遷移でアンマウントされる想定だが、保険で次フレーム close
      setTimeout(() => {
        close();
        onClose?.();
      }, 0);
    } catch (e: any) {
      // 自動ログインだけ失敗した場合：Progress を閉じて Info で案内
      setShow(false);
      setInfo({
        title: "自動ログイン失敗",
        message: e?.message ?? "登録は完了しましたが、ログインに失敗しました。",
      });
    }
  };

  return (
    <>
      {/* 入力フォーム */}
      <RegisterFormCard
        values={{
          userId: form.userId,
          password: form.password,
          confirmPassword: form.confirmPassword,
          contact: form.contact,
          userName: form.userName,
        }}
        errors={form.fieldErrors}
        availability={form.availability}
        checking={form.checking}
        submitting={submitting}
        onChange={{
          setUserId: form.setUserId,
          setPassword: form.setPassword,
          setConfirmPassword: form.setConfirmPassword,
          setContact: form.setContact,
          setUserName: form.setUserName,
        }}
        onCancel={handleCancel}
        onSubmit={handleRegister}
        submitDisabled={submitting || form.hasBlockingError || form.checking}
        actionRowRef={rowRef}
        onRootKeyDown={onRootKeyDown}
      />

      {/* 成功フロー：Progress（最低表示あり） */}
      {show && (
        <FadeModalWrapper
          onClose={() => setShow(false)}
          closeOnBackdrop={false}
          closeOnEsc={false}
        >
          <ProgressModal
            title="アカウント作成"
            processingText="登録中……"
            doneText="登録完了"
            status={status}
            confirmLabel="OK"
            onConfirm={handleProgressConfirm}
          />
        </FadeModalWrapper>
      )}

      {/* 失敗フロー：Info */}
      {info && (
        <FadeModalWrapper onClose={() => setInfo(null)} durationOpen={650}>
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
