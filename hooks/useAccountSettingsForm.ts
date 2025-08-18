"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type {
  AccountSettingsInitial,
  AccountSettingsDiff,
} from "@/components/mypage/AccountSettingsFormCard";

/** USER_ID の可用性 */
type Availability = "idle" | "checking" | "ok" | "ng";

export function useAccountSettingsForm(initial: AccountSettingsInitial) {
  const [values, setValues] = useState({
    login_id: initial.login_id ?? "",
    user_name: initial.user_name ?? "",
    contact: initial.contact ?? "",
    password: "",
    confirmPassword: "",
  });

  /** 初期値が外部から更新されたら、未編集状態であれば同期する */
  const prevInitialRef = useRef<AccountSettingsInitial | null>(null);
  const shallowEqualInitial = (
    a: AccountSettingsInitial,
    b: AccountSettingsInitial
  ) =>
    a.login_id === b.login_id &&
    a.user_name === b.user_name &&
    a.contact === b.contact;

  // 変更検出（password は空なら差分に含めない）
  const diff: AccountSettingsDiff = useMemo(() => {
    const d: AccountSettingsDiff = {};
    if (values.login_id.trim() !== (initial.login_id ?? "").trim())
      d.login_id = values.login_id.trim();
    if ((values.user_name ?? "") !== (initial.user_name ?? ""))
      d.user_name = values.user_name;
    if ((values.contact ?? "") !== (initial.contact ?? ""))
      d.contact = values.contact;
    if (values.password.trim()) d.password = values.password;
    return d;
  }, [values, initial]);

  const hasChanges = Object.keys(diff).length > 0;

  useEffect(() => {
    const prev = prevInitialRef.current;
    // 初回 or 初期値が変わった
    if (!prev || !shallowEqualInitial(prev, initial)) {
      // すでにユーザーが編集している場合は壊さない
      if (!hasChanges) {
        setValues((v) => ({
          ...v,
          login_id: initial.login_id ?? "",
          user_name: initial.user_name ?? "",
          contact: initial.contact ?? "",
          // password/confirmPassword は常に空維持
          password: "",
          confirmPassword: "",
        }));
      }
      prevInitialRef.current = initial;
    }
  }, [initial, hasChanges]);

  // USER_ID 可用性チェック（デバウンス）
  const [availability, setAvailability] = useState<Availability>("idle");
  const [loginIdError, setLoginIdError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loginIdPattern = /^[A-Za-z0-9_]+$/;

  useEffect(() => {
    setLoginIdError(null);

    const trimmed = values.login_id.trim();

    // 空はブロック（メッセージはフォーム側で neutral 表示）
    if (trimmed.length === 0) {
      setAvailability("idle");
      return;
    }

    // 変更なしならチェック不要
    if (trimmed === (initial.login_id ?? "").trim()) {
      setAvailability("idle");
      return;
    }

    // 形式チェック
    if (!loginIdPattern.test(trimmed)) {
      setAvailability("idle");
      setLoginIdError("半角英数字と _ のみ使用できます");
      return;
    }

    // デバウンスしてサーバー確認
    setAvailability("checking");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const r = await fetch(
          `/api/check-login-id?login_id=${encodeURIComponent(trimmed)}`
        );
        if (!r.ok) throw new Error("bad response");
        const data = await r.json(); // { available: boolean }
        setAvailability(data?.available ? "ok" : "ng");
      } catch {
        // 通信失敗時は NG 扱いよりも「idle」に戻すほうがUX無難
        setAvailability("idle");
      }
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [values.login_id, initial.login_id]);

  // パスワード一致チェック（任意）
  const [passwordError, setPasswordError] = useState<string | null>(null);
  useEffect(() => {
    if (!values.password && !values.confirmPassword) {
      setPasswordError(null);
      return;
    }
    if (values.password !== values.confirmPassword) {
      setPasswordError("確認用と一致しません");
    } else {
      setPasswordError(null);
    }
  }, [values.password, values.confirmPassword]);

  // ブロッキング判定
  const hasBlockingError =
    values.login_id.trim().length === 0 || // USER_ID 未入力はブロック
    !!loginIdError ||
    availability === "ng" ||
    availability === "checking" ||
    !!passwordError;

  const checking = availability === "checking";

  return {
    values,
    setValues,
    diff,
    hasChanges,
    availability:
      availability === "ok" ? "ok" : availability === "ng" ? "ng" : "idle",
    checking,
    loginIdError,
    passwordError,
    hasBlockingError,
  };
}
