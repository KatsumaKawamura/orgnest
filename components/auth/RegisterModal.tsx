"use client";

import { useState } from "react";
import { useRouter } from "next/router"; // Pages Router
import FadeModalWrapper, {
  useFadeModal,
} from "@/components/common/FadeModalWrapper";
import InfoModal from "@/components/common/InfoModal";
import ProgressModal from "@/components/common/ProgressModal";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import RegisterFormCard from "@/components/auth/RegisterFormCard";
import RegisterReviewDialog from "@/components/auth/RegisterReviewDialog";
import { useRegisterForm } from "@/hooks/useRegisterForm";
import { useProgressOverlay } from "@/hooks/useProgressOverlay";
import useModalActionRoving from "@/hooks/useModalActionRoving";

interface RegisterModalProps {
  onClose: () => void;
}

export default function RegisterModal({ onClose }: RegisterModalProps) {
  const router = useRouter();
  const { close } = useFadeModal();

  // 入力 + リアルタイム検証
  const form = useRegisterForm();

  // 進捗オーバーレイ
  const { show, setShow, status, runWithMinDelay } = useProgressOverlay();

  // 事前レビュー表示
  const [showPreReview, setShowPreReview] = useState(false);

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

  // ★ キャンセル確認ダイアログの表示状態
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  // キャンセル押下 → 確認を出す（いきなり閉じない）
  const handleCancel = () => setShowDiscardConfirm(true);

  // 確認：OK（破棄して親モーダルを閉じる＝外側の close）
  const handleDiscardConfirm = () => {
    // ここではネスト内の確認ダイアログは自分で close() 済み（ConfirmDialog側修正）
    // 親モーダル（登録フォーム本体）を閉じる
    close();
    onClose?.();
  };

  // 実際の登録処理（既存のまま）
  const handleRegister = async () => {
    if (submitting || form.hasBlockingError || form.checking) return;

    setSubmitting(true);

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
        credentials: "same-origin",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "登録に失敗しました");
      return data;
    });

    setSubmitting(false);

    if (!ok) {
      setInfo({ title: "登録失敗", message: (error as Error).message });
    }
    // 成功時：Progress 側が "done" 表示 → OK で onConfirm が呼ばれる
  };

  // 登録完了 → OK：自動ログイン → 遷移（push→close）
  const handleProgressConfirm = async () => {
    try {
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

      router.push("/mypage");
      setTimeout(() => {
        close();
        onClose?.();
      }, 0);
    } catch (e: any) {
      setShow(false);
      setInfo({
        title: "自動ログイン失敗",
        message: e?.message ?? "登録は完了しましたが、ログインに失敗しました。",
      });
    }
  };

  // 「登録」ボタン押下 → まずはレビュー表示
  const handleSubmitClick = () => {
    if (submitting || form.hasBlockingError || form.checking) return;
    setShowPreReview(true);
  };

  // Review: 登録する（※ここで show を直接落とさない）
  const handlePreReviewConfirm = async () => {
    await handleRegister();
  };

  // Review: 戻る（※ここで show を直接落とさない）
  const handlePreReviewCancel = () => {
    // noop: 子が close() → onClose で setShowPreReview(false)
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
        onSubmit={handleSubmitClick}
        submitDisabled={submitting || form.hasBlockingError || form.checking}
        actionRowRef={rowRef}
        onRootKeyDown={onRootKeyDown}
      />

      {/* 入力内容の確認（asChild） */}
      {showPreReview && (
        <FadeModalWrapper onClose={() => setShowPreReview(false)} asChild>
          <RegisterReviewDialog
            title="入力内容の確認"
            values={{
              userId: form.userId,
              password: form.password,
              contact: form.contact,
              userName: form.userName,
            }}
            labels={{
              userId: "USER_ID",
              password: "PASSWORD",
              contact: "CONTACT",
              userName: "USER_NAME",
            }}
            maskPassword={true}
            cancelLabel="戻る"
            confirmLabel="登録する"
            onCancel={handlePreReviewCancel} // ← 子が close()、ここでは状態操作しない
            onConfirm={handlePreReviewConfirm} // ← 子が close()、ここでは状態操作しない
          />
        </FadeModalWrapper>
      )}

      {/* 成功フロー：Progress（asChild） */}
      {show && (
        <FadeModalWrapper
          onClose={() => setShow(false)}
          closeOnBackdrop={false}
          closeOnEsc={false}
          asChild
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

      {/* 失敗フロー：Info（asChild） */}
      {info && (
        <FadeModalWrapper
          onClose={() => setInfo(null)}
          durationOpen={650}
          asChild
        >
          <InfoModal
            title={info.title}
            message={info.message}
            onConfirm={() => {
              /* InfoModalがclose()するので空でOK */
            }}
          />
        </FadeModalWrapper>
      )}

      {/* キャンセル確認（asChild） */}
      {showDiscardConfirm && (
        <FadeModalWrapper
          onClose={() => setShowDiscardConfirm(false)}
          closeOnBackdrop={false}
          closeOnEsc={true}
          asChild
        >
          <ConfirmDialog
            asModalChild
            title="確認"
            message="入力を破棄しますか？"
            cancelLabel="キャンセル"
            confirmLabel="OK"
            onCancel={() => {
              /* 子がclose() → onCloseでOFF */
            }}
            onConfirm={handleDiscardConfirm} // 子がclose() → その後、親モーダルclose()
          />
        </FadeModalWrapper>
      )}
    </>
  );
}
