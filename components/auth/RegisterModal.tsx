// components/auth/RegisterModal.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router"; // Pages Router
import FadeModalWrapper, {
  useFadeModal,
} from "@/components/common/FadeModalWrapper";
import InfoModal from "@/components/common/InfoModal";
import ProgressModal from "@/components/common/ProgressModal";
import ConfirmDialog from "@/components/common/ConfirmDialog";
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

  // 入力 + リアルタイム検証
  const form = useRegisterForm();

  // 進捗オーバーレイ
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

  // ★ キャンセル確認ダイアログの表示状態
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  // --- 多重モーダル時の inert 付与（最前面以外を無効化）-----------------------
  useEffect(() => {
    if (typeof document === "undefined") return;

    const overlayActive = !!showDiscardConfirm || !!show || !!info;

    // 自分が付けた inert/aria-hidden だけをクリーンアップする関数
    const clearMine = () => {
      document
        .querySelectorAll<HTMLElement>("[data-inert-by-register]")
        .forEach((el) => {
          el.removeAttribute("inert");
          el.removeAttribute("data-inert-by-register");
        });
      document
        .querySelectorAll<HTMLElement>("[data-aria-hidden-by-register]")
        .forEach((el) => {
          el.removeAttribute("aria-hidden");
          el.removeAttribute("data-aria-hidden-by-register");
        });
    };

    // いったん自分の付与分だけクリア（前回分を除去）
    clearMine();

    if (!overlayActive) {
      // 二次モーダルが出ていなければ何もしない
      return;
    }

    // 最後の子 = 最前面（確認/進捗/Info 等） それ以外を inert
    const kids = Array.from(document.body.children);
    for (let i = 0; i < kids.length - 1; i++) {
      const n = kids[i] as HTMLElement;
      if (!n.hasAttribute("inert")) {
        n.setAttribute("inert", "");
        n.setAttribute("data-inert-by-register", "");
      }
      if (!n.hasAttribute("aria-hidden")) {
        n.setAttribute("aria-hidden", "true");
        n.setAttribute("data-aria-hidden-by-register", "");
      }
    }

    // 解除（依存が変わる/アンマウント時）
    return clearMine;
  }, [showDiscardConfirm, show, info]);
  // -----------------------------------------------------------------------

  // キャンセル押下 → 確認を出す（いきなり閉じない）
  const handleCancel = () => {
    setShowDiscardConfirm(true);
  };

  // 確認：OK（破棄して閉じる）
  const handleDiscardConfirm = () => {
    setShowDiscardConfirm(false);
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
            onConfirm={() => setInfo(null)}
          />
        </FadeModalWrapper>
      )}

      {/* ★ キャンセル確認（asChild：OK/キャンセルのシンプル版） */}
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
            onCancel={() => setShowDiscardConfirm(false)}
            onConfirm={handleDiscardConfirm}
          />
        </FadeModalWrapper>
      )}
    </>
  );
}
