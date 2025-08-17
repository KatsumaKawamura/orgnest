// components/auth/RegisterModal.tsx
"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/router"; // Pages Router 継続
import FadeModalWrapper, {
  useFadeModal,
} from "@/components/common/FadeModalWrapper";
import InfoModal from "@/components/common/InfoModal";
import ProgressModal from "@/components/common/ProgressModal";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import RegisterFormCard from "@/components/auth/RegisterFormCard";
import RegisterReviewDialog from "@/components/auth/RegisterReviewDialog";
import useRegisterForm from "@/hooks/useRegisterForm"; // ← ここが変更
import { useProgressOverlay } from "@/hooks/useProgressOverlay";
import useModalActionRoving from "@/hooks/useModalActionRoving";

interface RegisterModalProps {
  onClose: () => void;
}

export default function RegisterModal({ onClose }: RegisterModalProps) {
  const router = useRouter();
  const { close } = useFadeModal();

  // 入力 + リアルタイム検証（正準型で受ける）
  const form = useRegisterForm();

  // 進捗オーバーレイ
  const { show, setShow, status, runWithMinDelay } = useProgressOverlay();

  // 事前レビュー表示
  const [showPreReview, setShowPreReview] = useState(false);
  // レビュー確定後、フェード完了で登録開始するためのフラグ
  const reviewConfirmPendingRef = useRef(false);

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

  // キャンセル確認
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const discardAndCloseParentRef = useRef(false);

  const handleCancel = () => setShowDiscardConfirm(true);
  const handleDiscardConfirm = () => {
    discardAndCloseParentRef.current = true;
  };

  // 実際の登録処理
  const handleRegister = async () => {
    if (submitting || form.hasBlockingError || form.checking.userId) return;

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

  const handleSubmitClick = () => {
    if (submitting || form.hasBlockingError || form.checking.userId) return;
    setShowPreReview(true);
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
        availability={form.availability} // { userId?: 'unknown' | 'available' | 'taken' }
        checking={form.checking} // { userId: boolean }
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
        submitDisabled={
          submitting || form.hasBlockingError || form.checking.userId
        }
        actionRowRef={rowRef}
        onRootKeyDown={onRootKeyDown}
      />

      {/* 入力内容の確認（asChild） */}
      {showPreReview && (
        <FadeModalWrapper
          onClose={() => {
            // 子レビューのフェード完了
            setShowPreReview(false);
            if (reviewConfirmPendingRef.current) {
              reviewConfirmPendingRef.current = false;
              handleRegister(); // 完全クローズ後に開始
            }
          }}
          asChild
        >
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
            onCancel={() => {
              /* 子が close() → onClose で setShowPreReview(false) */
            }}
            onConfirm={() => {
              // フェード完了で実行
              reviewConfirmPendingRef.current = true;
            }}
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
          onClose={() => {
            setShowDiscardConfirm(false);
            if (discardAndCloseParentRef.current) {
              discardAndCloseParentRef.current = false;
              close();
              onClose?.();
            }
          }}
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
              /* 子が close() */
            }}
            onConfirm={() => {
              // 親は onClose で閉じる
              discardAndCloseParentRef.current = true;
            }}
          />
        </FadeModalWrapper>
      )}
    </>
  );
}
