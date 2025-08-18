// @/components/account/SettingsModal.tsx

"use client";

import { useEffect, useRef, useState } from "react";
import FadeModalWrapper, {
  useFadeModal,
} from "@/components/common/FadeModalWrapper";
import InfoModal from "@/components/common/InfoModal";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import SettingsFormCard from "@/components/account/SettingsFormCard";
import { useAccountForm } from "@/hooks/useAccountForm";
import useModalActionRoving from "@/hooks/useModalActionRoving";

export type Me = {
  login_id: string;
  user_name: string | null;
  contact: string | null;
};

export interface SettingsModalProps {
  onClose: () => void;
  /** Containerから受け取れる現在ユーザー。あれば /api/me をスキップ */
  initial?: Me;
}

export default function SettingsModal({
  onClose,
  initial,
}: SettingsModalProps) {
  const { close } = useFadeModal();

  // ←/→ roving
  const { rowRef, onRootKeyDown } = useModalActionRoving({
    loop: true,
    overrideInput: true,
  });

  // 初期値
  const [me, setMe] = useState<Me | null>(initial ?? null);
  const [loading, setLoading] = useState(!initial);
  const [loadError, setLoadError] = useState<string | null>(null);

  // initial がない場合のみ /api/me を取得（未ログイン等ならここで認証エラー）
  useEffect(() => {
    if (initial) return; // 既にあるのでフェッチ不要
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setLoadError(null);
        const res = await fetch("/api/me", { credentials: "same-origin" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || "認証エラー");
        if (!alive) return;
        setMe({
          login_id: data?.login_id ?? "",
          user_name: data?.user_name ?? "",
          contact: data?.contact ?? "",
        });
      } catch (e: any) {
        if (!alive) return;
        setLoadError(e?.message ?? "認証エラー");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [initial]);

  // 通知（エラー、完了）
  const [info, setInfo] = useState<{ title: string; message: string } | null>(
    null
  );

  // 連打防止
  const [submitting, setSubmitting] = useState(false);

  // 破棄確認
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const discardAndCloseParentRef = useRef(false);

  // me が揃ってからフォーム起動
  const form = useAccountForm({
    mode: "update",
    initial: me ?? undefined,
  });

  const handleCancel = () => {
    if (!form.dirty) {
      close();
    } else {
      setShowDiscardConfirm(true);
    }
  };
  const handleDiscardConfirm = () => {
    discardAndCloseParentRef.current = true;
  };

  const handleUpdate = async () => {
    if (submitting || !form.canSubmit) return;
    setSubmitting(true);

    try {
      const body: Record<string, unknown> = {};
      if (form.values.userId !== (me?.login_id ?? ""))
        body.login_id = form.values.userId;
      if (form.values.userName !== (me?.user_name ?? ""))
        body.user_name = form.values.userName;
      if (form.values.contact !== (me?.contact ?? ""))
        body.contact = form.values.contact;
      if (form.values.password) body.password = form.values.password;

      const res = await fetch("/api/user/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "更新に失敗しました");

      setInfo({ title: "更新完了", message: "アカウント情報を更新しました。" });
    } catch (e: any) {
      setInfo({
        title: "更新失敗",
        message: e?.message ?? "更新に失敗しました。",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ローディング or エラー表示
  if (loading) {
    return (
      <div className="bg-white text-gray-800 p-6 rounded shadow-lg w-[min(92vw,420px)]">
        <h2 className="text-lg font-semibold mb-2">アカウント設定</h2>
        <p className="text-sm text-gray-600">読み込み中…</p>
      </div>
    );
  }
  if (loadError) {
    return (
      <>
        <div className="bg-white text-gray-800 p-6 rounded shadow-lg w-[min(92vw,420px)]">
          <h2 className="text-lg font-semibold mb-2">アカウント設定</h2>
          <p className="text-sm text-red-600">{loadError}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <SettingsFormCard
        values={{
          userId: form.values.userId,
          password: form.values.password,
          confirmPassword: form.values.confirmPassword,
          contact: form.values.contact,
          userName: form.values.userName,
        }}
        errors={form.fieldErrors}
        availability={form.availability}
        checking={form.checking}
        submitting={submitting}
        onChange={{
          setUserId: form.setters.setUserId,
          setPassword: form.setters.setPassword,
          setConfirmPassword: form.setters.setConfirmPassword,
          setContact: form.setters.setContact,
          setUserName: form.setters.setUserName,
        }}
        onCancel={handleCancel}
        onSubmit={handleUpdate}
        submitDisabled={submitting || !form.canSubmit}
        actionRowRef={rowRef}
        onRootKeyDown={onRootKeyDown}
      />

      {/* 失敗/成功Info */}
      {info && (
        <FadeModalWrapper
          onClose={() => {
            setInfo(null);
            if (info.title === "更新完了") {
              close();
              onClose?.();
            }
          }}
          durationOpen={650}
          asChild
        >
          <InfoModal
            title={info.title}
            message={info.message}
            onConfirm={() => {}}
          />
        </FadeModalWrapper>
      )}

      {/* 破棄確認 */}
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
            message="変更を破棄しますか？"
            cancelLabel="キャンセル"
            confirmLabel="OK"
            onCancel={() => {}}
            onConfirm={handleDiscardConfirm}
          />
        </FadeModalWrapper>
      )}
    </>
  );
}
