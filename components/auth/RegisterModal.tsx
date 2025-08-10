// components/auth/RegisterModal.tsx
"use client";

import { useState } from "react";
import FadeModalWrapper, {
  useFadeModal,
} from "@/components/common/FadeModalWrapper";
import InfoModal from "@/components/common/InfoModal";
import ProgressModal from "@/components/common/ProgressModal";
import RegisterFormCard from "@/components/auth/RegisterFormCard";
import { useRegisterForm } from "@/hooks/useRegisterForm";
import { useProgressOverlay } from "@/hooks/useProgressOverlay";
import useModalActionRoving from "@/hooks/useModalActionRoving"; // ← 追加

interface RegisterModalProps {
  onClose: () => void;
}

export default function RegisterModal({ onClose }: RegisterModalProps) {
  const { close } = useFadeModal();

  // 入力 + リアルタイム検証（必須 / 一致 / 可用性）
  const form = useRegisterForm();

  // 進捗オーバーレイ（最低 800ms 表示は hook 側で担保）
  const { show, setShow, status, runWithMinDelay } = useProgressOverlay();

  // API 失敗などの通知用
  const [info, setInfo] = useState<{ title: string; message: string } | null>(
    null
  );

  // 連打防止・フォームロック
  const [submitting, setSubmitting] = useState(false);

  // ←/→：外から“引き込み” & 行内 roving（右＝登録、左＝キャンセル）
  // 登録フォームは「入力中でも左右で引き込みたい」要件なので overrideInput: true のまま
  const { rowRef, onRootKeyDown } = useModalActionRoving({
    loop: true,
    overrideInput: true,
  });

  const handleCancel = () => {
    close(); // 親ラッパーのフェード閉鎖
    onClose?.();
  };

  const handleRegister = async () => {
    if (submitting || form.hasBlockingError || form.checking) return;

    setSubmitting(true);

    // Progress を表示しつつ最低 800ms を担保して /api/register を実行
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
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "登録に失敗しました");
      return data;
    });

    setSubmitting(false);

    if (!ok) {
      // 失敗時：Progress は hook 側で閉じ済み。Info を開く（開きは少し長めで柔らかく）
      setInfo({ title: "登録失敗", message: (error as Error).message });
    }
    // 成功時は Progress 側が "done" 表示になる → OK で閉じるフローへ
  };

  const handleProgressConfirm = () => {
    // 登録完了 → OK：親モーダルを閉じる（必要なら遷移はここで）
    close();
    onClose?.();
  };

  return (
    <>
      {/* 入力フォーム（見た目コンポーネントに委譲） */}
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
        // ← 追加：左右キー対応のために渡す
        actionRowRef={rowRef}
        onRootKeyDown={onRootKeyDown}
      />

      {/* 成功フロー：Progress（最低 800ms 表示） */}
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

      {/* 失敗フロー：Info（開き長めで切替を柔らかく） */}
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
